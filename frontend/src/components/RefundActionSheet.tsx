import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface RefundOption {
  label: string;
  sublabel?: string;
  amount: string;
  icon: string;
  color: string;
  recommended?: boolean;
  type: 'full' | 'partial' | 'item' | 'goodwill' | 'custom';
  chargedTo: 'platform' | 'merchant' | 'split';
}

interface OrderDetails {
  orderId: string;
  total: string;
  items: string[];
  reportedIssue: string;
  customerName: string;
}

interface CustomerHistory {
  totalOrders: number;
  totalRefunds: number;
  refundRate: number;
  trustScore: 'high' | 'medium' | 'low';
  lastRefund?: string;
}

interface RefundActionSheetProps {
  visible: boolean;
  orderDetails: OrderDetails;
  customerHistory: CustomerHistory;
  onRefund: (amount: string, type: string, destination: string, chargedTo: string) => void;
  onClose: () => void;
}

export default function RefundActionSheet({
  visible,
  orderDetails,
  customerHistory,
  onRefund,
  onClose,
}: RefundActionSheetProps) {
  const [selectedDestination, setSelectedDestination] = useState<'payment' | 'wallet' | 'credit'>('payment');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const refundOptions: RefundOption[] = [
    {
      label: 'Missing Item Only',
      sublabel: 'Recommended based on issue',
      amount: '₦800',
      icon: '🎯',
      color: colors.success,
      recommended: true,
      type: 'item',
      chargedTo: 'merchant',
    },
    {
      label: 'Full Order Refund',
      sublabel: 'Entire order amount',
      amount: orderDetails.total,
      icon: '💰',
      color: colors.error,
      type: 'full',
      chargedTo: 'platform',
    },
    {
      label: 'Goodwill Credit',
      sublabel: 'Wallet credit + 10% bonus',
      amount: '₦1,000',
      icon: '🎁',
      color: colors.warning,
      type: 'goodwill',
      chargedTo: 'platform',
    },
    {
      label: 'Partial Refund',
      sublabel: '50% of order total',
      amount: '₦1,225',
      icon: '💵',
      color: colors.info,
      type: 'partial',
      chargedTo: 'split',
    },
  ];

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case 'high': return colors.success;
      case 'medium': return colors.warning;
      case 'low': return colors.error;
      default: return colors.textLight;
    }
  };

  const handleRefund = (option: RefundOption) => {
    const destination = selectedDestination === 'payment' ? 'Original Payment Method' :
                       selectedDestination === 'wallet' ? 'Platform Wallet (Instant)' :
                       'Store Credit (+10% Bonus)';
    onRefund(option.amount, option.type, destination, option.chargedTo);
    onClose();
  };

  const handleCustomRefund = () => {
    if (customAmount && parseFloat(customAmount) > 0) {
      onRefund(`₦${customAmount}`, 'custom', 
        selectedDestination === 'payment' ? 'Original Payment Method' :
        selectedDestination === 'wallet' ? 'Platform Wallet (Instant)' :
        'Store Credit (+10% Bonus)', 'platform');
      setShowCustomAmount(false);
      setCustomAmount('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Issue Refund</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Order Context */}
            <View style={styles.orderContext}>
              <View style={styles.contextRow}>
                <Ionicons name="receipt-outline" size={16} color={colors.navy} />
                <Text style={styles.contextLabel}>Order {orderDetails.orderId}</Text>
                <Text style={styles.contextValue}>{orderDetails.total}</Text>
              </View>
              <View style={styles.contextRow}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.contextLabel}>Issue:</Text>
                <Text style={styles.issueText}>{orderDetails.reportedIssue}</Text>
              </View>
              <View style={styles.itemsList}>
                <Text style={styles.itemsLabel}>Order Items:</Text>
                {orderDetails.items.map((item, index) => (
                  <Text key={index} style={styles.itemText}>• {item}</Text>
                ))}
              </View>
            </View>

            {/* Customer History */}
            <View style={[styles.customerHistory, 
              customerHistory.trustScore === 'low' && styles.customerHistoryWarning
            ]}>
              <View style={styles.historyHeader}>
                <Ionicons 
                  name={customerHistory.trustScore === 'high' ? 'shield-checkmark' : 
                        customerHistory.trustScore === 'medium' ? 'shield-half' : 'warning'} 
                  size={16} 
                  color={getTrustScoreColor(customerHistory.trustScore)} 
                />
                <Text style={styles.historyTitle}>Customer History</Text>
                <View style={[styles.trustBadge, { backgroundColor: getTrustScoreColor(customerHistory.trustScore) + '15' }]}>
                  <Text style={[styles.trustText, { color: getTrustScoreColor(customerHistory.trustScore) }]}>
                    {customerHistory.trustScore.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{customerHistory.totalOrders}</Text>
                  <Text style={styles.historyStatLabel}>Total Orders</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={styles.historyStatValue}>{customerHistory.totalRefunds}</Text>
                  <Text style={styles.historyStatLabel}>Refunds</Text>
                </View>
                <View style={styles.historyStat}>
                  <Text style={[styles.historyStatValue, 
                    customerHistory.refundRate > 20 && { color: colors.error }
                  ]}>
                    {customerHistory.refundRate}%
                  </Text>
                  <Text style={styles.historyStatLabel}>Refund Rate</Text>
                </View>
              </View>
              {customerHistory.trustScore === 'low' && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning" size={14} color={colors.error} />
                  <Text style={styles.warningText}>High refund rate - review carefully</Text>
                </View>
              )}
            </View>

            {/* Refund Destination */}
            <View style={styles.destinationSection}>
              <Text style={styles.sectionTitle}>Refund Destination</Text>
              <View style={styles.destinationOptions}>
                <TouchableOpacity
                  style={[styles.destinationOption, selectedDestination === 'payment' && styles.destinationOptionActive]}
                  onPress={() => setSelectedDestination('payment')}
                >
                  <Ionicons 
                    name="card-outline" 
                    size={20} 
                    color={selectedDestination === 'payment' ? colors.navy : colors.textSecondary} 
                  />
                  <View style={styles.destinationInfo}>
                    <Text style={[styles.destinationLabel, selectedDestination === 'payment' && styles.destinationLabelActive]}>
                      Payment Method
                    </Text>
                    <Text style={styles.destinationSublabel}>3-5 business days</Text>
                  </View>
                  {selectedDestination === 'payment' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.navy} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destinationOption, selectedDestination === 'wallet' && styles.destinationOptionActive]}
                  onPress={() => setSelectedDestination('wallet')}
                >
                  <Ionicons 
                    name="wallet-outline" 
                    size={20} 
                    color={selectedDestination === 'wallet' ? colors.navy : colors.textSecondary} 
                  />
                  <View style={styles.destinationInfo}>
                    <Text style={[styles.destinationLabel, selectedDestination === 'wallet' && styles.destinationLabelActive]}>
                      Platform Wallet
                    </Text>
                    <Text style={styles.destinationSublabel}>Instant</Text>
                  </View>
                  {selectedDestination === 'wallet' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.navy} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destinationOption, selectedDestination === 'credit' && styles.destinationOptionActive]}
                  onPress={() => setSelectedDestination('credit')}
                >
                  <Ionicons 
                    name="gift-outline" 
                    size={20} 
                    color={selectedDestination === 'credit' ? colors.navy : colors.textSecondary} 
                  />
                  <View style={styles.destinationInfo}>
                    <Text style={[styles.destinationLabel, selectedDestination === 'credit' && styles.destinationLabelActive]}>
                      Store Credit
                    </Text>
                    <Text style={styles.destinationSublabel}>Instant + 10% bonus</Text>
                  </View>
                  {selectedDestination === 'credit' && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.navy} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Refund Options */}
            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>Refund Amount</Text>
              {refundOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.refundOption, option.recommended && styles.refundOptionRecommended]}
                  onPress={() => handleRefund(option)}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <View style={styles.optionInfo}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.recommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>RECOMMENDED</Text>
                        </View>
                      )}
                    </View>
                    {option.sublabel && (
                      <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                    )}
                    <View style={styles.optionFooter}>
                      <Text style={styles.chargedTo}>
                        Charged to: {option.chargedTo === 'platform' ? 'Platform' : 
                                    option.chargedTo === 'merchant' ? 'Merchant' : 'Split 50/50'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.optionAmount, { color: option.color }]}>{option.amount}</Text>
                </TouchableOpacity>
              ))}

              {/* Custom Amount */}
              <TouchableOpacity
                style={styles.refundOption}
                onPress={() => setShowCustomAmount(!showCustomAmount)}
              >
                <Text style={styles.optionIcon}>✏️</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionLabel}>Custom Amount</Text>
                  <Text style={styles.optionSublabel}>Enter specific refund amount</Text>
                </View>
                <Ionicons 
                  name={showCustomAmount ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>

              {showCustomAmount && (
                <View style={styles.customAmountInput}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={setCustomAmount}
                  />
                  <TouchableOpacity 
                    style={[styles.processBtn, !customAmount && styles.processBtnDisabled]}
                    onPress={handleCustomRefund}
                    disabled={!customAmount}
                  >
                    <Text style={styles.processBtnText}>Process</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  orderContext: {
    backgroundColor: colors.lightGray,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contextLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  contextValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  issueText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  itemsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: 8,
    marginTop: 2,
  },
  customerHistory: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customerHistoryWarning: {
    borderColor: colors.error,
    backgroundColor: colors.error + '05',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  trustBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  historyStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.error + '20',
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  destinationSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  destinationOptions: {
    gap: 8,
  },
  destinationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  destinationOptionActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy + '05',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  destinationLabelActive: {
    color: colors.navy,
  },
  destinationSublabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  optionsSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  refundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
    gap: 12,
  },
  refundOptionRecommended: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.success + '08',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textWhite,
  },
  optionSublabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  optionFooter: {
    marginTop: 4,
  },
  chargedTo: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  optionAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  processBtn: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  processBtnDisabled: {
    backgroundColor: colors.border,
  },
  processBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
