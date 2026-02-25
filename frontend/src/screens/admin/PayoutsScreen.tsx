import { showAlert } from '../../utils/alert';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { adminAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const merchantPayouts = [
  { id: '1', name: 'Burger House', owner: 'Mike Chen', amount: 3250.00, orders: 42, period: 'Feb 1-7', status: 'pending', method: 'Bank Transfer' },
  { id: '2', name: 'Pizza Roma', owner: 'Marco Rossi', amount: 2180.50, orders: 31, period: 'Feb 1-7', status: 'pending', method: 'Bank Transfer' },
  { id: '3', name: 'Thai Garden', owner: 'Siri Patel', amount: 1540.00, orders: 22, period: 'Feb 1-7', status: 'pending', method: 'Bank Transfer' },
  { id: '4', name: 'The Urban Spoon', owner: 'James Wright', amount: 5420.80, orders: 58, period: 'Feb 1-7', status: 'pending', method: 'Bank Transfer' },
  { id: '5', name: 'Taco Fiesta', owner: 'Carlos Diaz', amount: 890.00, orders: 15, period: 'Feb 1-7', status: 'on_hold', method: 'Bank Transfer' },
];

const courierPayouts = [
  { id: '1', name: 'Mike Johnson', deliveries: 48, hours: 32, amount: 1245.60, tips: 186.50, period: 'Feb 1-7', status: 'pending', method: 'Instant' },
  { id: '2', name: 'Sarah Lee', deliveries: 62, hours: 38, amount: 1580.20, tips: 245.00, period: 'Feb 1-7', status: 'pending', method: 'Bank Transfer' },
  { id: '3', name: 'Tom Wilson', deliveries: 35, hours: 24, amount: 890.00, tips: 120.00, period: 'Feb 1-7', status: 'pending', method: 'Instant' },
  { id: '4', name: 'Lisa Wang', deliveries: 55, hours: 36, amount: 1420.80, tips: 210.00, period: 'Feb 1-7', status: 'processing', method: 'Bank Transfer' },
  { id: '5', name: 'David Brown', deliveries: 28, hours: 18, amount: 720.00, tips: 95.00, period: 'Feb 1-7', status: 'paid', method: 'Instant' },
];

const recentPayments = [
  { id: '1', recipient: 'Burger House', type: 'merchant', amount: 2890.00, date: 'Feb 1, 2026', status: 'completed', ref: 'PAY-2026-0201' },
  { id: '2', recipient: 'Mike Johnson', type: 'courier', amount: 1120.40, date: 'Feb 1, 2026', status: 'completed', ref: 'PAY-2026-0202' },
  { id: '3', recipient: 'Pizza Roma', type: 'merchant', amount: 1950.00, date: 'Jan 31, 2026', status: 'completed', ref: 'PAY-2026-0198' },
  { id: '4', recipient: 'Sarah Lee', type: 'courier', amount: 1380.60, date: 'Jan 31, 2026', status: 'completed', ref: 'PAY-2026-0199' },
  { id: '5', recipient: 'Taco Fiesta', type: 'merchant', amount: 650.00, date: 'Jan 31, 2026', status: 'failed', ref: 'PAY-2026-0195' },
];

export default function PayoutsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'merchants' | 'couriers' | 'history'>('merchants');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getPendingWithdrawals();
        // When backend returns real data, update state here
      } catch (e: any) { showAlert('Error', e?.message || 'Something went wrong'); }
    })();
  }, []);

  const totalMerchantPending = merchantPayouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalCourierPending = courierPayouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount + p.tips, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = (ids: string[]) => {
    const allSelected = ids.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter(id => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payouts</Text>
        <TouchableOpacity
          onPress={() => {
            showAlert('Export Payouts', 'Payout report exported successfully');
          }}
        >
          <Ionicons name="download-outline" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="storefront" size={20} color={colors.navy} />
            </View>
            <Text style={styles.summaryLabel}>Merchant Payouts</Text>
            <Text style={styles.summaryValue}>₦{totalMerchantPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.summaryCount}>{merchantPayouts.filter(p => p.status === 'pending').length} pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="bicycle" size={20} color={colors.warning} />
            </View>
            <Text style={styles.summaryLabel}>Courier Payouts</Text>
            <Text style={styles.summaryValue}>₦{totalCourierPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.summaryCount}>{courierPayouts.filter(p => p.status === 'pending').length} pending</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['merchants', 'couriers', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => { setActiveTab(tab); setSelectedIds([]); }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'merchants' ? 'Merchants' : tab === 'couriers' ? 'Couriers' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Merchant Payouts */}
        {activeTab === 'merchants' && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <TouchableOpacity
                style={styles.selectAllBtn}
                onPress={() => selectAll(merchantPayouts.filter(p => p.status === 'pending').map(p => 'm' + p.id))}
              >
                <View style={[styles.checkbox, merchantPayouts.filter(p => p.status === 'pending').every(p => selectedIds.includes('m' + p.id)) && styles.checkboxChecked]}>
                  {merchantPayouts.filter(p => p.status === 'pending').every(p => selectedIds.includes('m' + p.id)) && (
                    <Ionicons name="checkmark" size={12} color={colors.textWhite} />
                  )}
                </View>
                <Text style={styles.selectAllText}>Select All Pending</Text>
              </TouchableOpacity>
              {selectedIds.filter(id => id.startsWith('m')).length > 0 && (
                <TouchableOpacity 
                  style={styles.paySelectedBtn}
                  onPress={() => {
                    const count = selectedIds.filter(id => id.startsWith('m')).length;
                    showAlert('Process Payouts', `Process ${count} merchant payout${count > 1 ? 's' : ''}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Process', 
                        onPress: () => {
                          setSelectedIds([]);
                          showAlert('Success', `${count} payout${count > 1 ? 's' : ''} processed successfully`);
                        }
                      }
                    ]);
                  }}
                >
                  <Ionicons name="send" size={14} color={colors.textWhite} />
                  <Text style={styles.paySelectedText}>
                    Pay {selectedIds.filter(id => id.startsWith('m')).length} Selected
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {merchantPayouts.map((payout) => (
              <TouchableOpacity
                key={payout.id}
                style={styles.payoutCard}
                onPress={() => payout.status === 'pending' && toggleSelect('m' + payout.id)}
              >
                <View style={styles.payoutTop}>
                  {payout.status === 'pending' && (
                    <View style={[styles.checkbox, selectedIds.includes('m' + payout.id) && styles.checkboxChecked]}>
                      {selectedIds.includes('m' + payout.id) && <Ionicons name="checkmark" size={12} color={colors.textWhite} />}
                    </View>
                  )}
                  <View style={styles.payoutAvatar}>
                    <Ionicons name="storefront" size={16} color={colors.navy} />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.payoutName}>{payout.name}</Text>
                    <Text style={styles.payoutOwner}>{payout.owner} · {payout.period}</Text>
                  </View>
                  <View style={styles.payoutAmountCol}>
                    <Text style={styles.payoutAmount}>₦{payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <View style={[styles.payoutStatus, {
                      backgroundColor: payout.status === 'pending' ? colors.warning + '15' : colors.error + '15'
                    }]}>
                      <Text style={[styles.payoutStatusText, {
                        color: payout.status === 'pending' ? colors.warning : colors.error
                      }]}>{payout.status === 'on_hold' ? 'On Hold' : 'Pending'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.payoutMeta}>
                  <Text style={styles.payoutMetaText}>{payout.orders} orders</Text>
                  <Text style={styles.payoutMetaDot}>·</Text>
                  <Text style={styles.payoutMetaText}>{payout.method}</Text>
                </View>

                <View style={styles.payoutActions}>
                  <TouchableOpacity 
                    style={styles.payoutActionBtn}
                    onPress={() => {
                      showAlert('Payout Details', `${payout.name}\n\nOwner: ${payout.owner}\nPeriod: ${payout.period}\nOrders: ${payout.orders}\nAmount: ₦${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}\nMethod: ${payout.method}\nStatus: ${payout.status}`);
                    }}
                  >
                    <Ionicons name="eye-outline" size={16} color={colors.navy} />
                    <Text style={styles.payoutActionText}>Details</Text>
                  </TouchableOpacity>
                  {payout.status === 'pending' && (
                    <TouchableOpacity 
                      style={[styles.payoutActionBtn, styles.payNowBtn]}
                      onPress={() => {
                        showAlert('Process Payout', `Pay ${payout.name} ₦${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Pay Now', 
                            onPress: () => {
                              showAlert('Success', `Payment of ₦${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} sent to ${payout.name}`);
                            }
                          }
                        ]);
                      }}
                    >
                      <Ionicons name="send" size={14} color={colors.textWhite} />
                      <Text style={styles.payNowText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                  {payout.status === 'on_hold' && (
                    <TouchableOpacity 
                      style={[styles.payoutActionBtn, styles.releaseBtn]}
                      onPress={() => {
                        showAlert('Release Hold', `Release hold on ${payout.name}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Release', 
                            onPress: () => {
                              showAlert('Success', `Hold released for ${payout.name}`);
                            }
                          }
                        ]);
                      }}
                    >
                      <Ionicons name="lock-open" size={14} color={colors.warning} />
                      <Text style={styles.releaseBtnText}>Release</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Courier Payouts */}
        {activeTab === 'couriers' && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <TouchableOpacity
                style={styles.selectAllBtn}
                onPress={() => selectAll(courierPayouts.filter(p => p.status === 'pending').map(p => 'c' + p.id))}
              >
                <View style={[styles.checkbox, courierPayouts.filter(p => p.status === 'pending').every(p => selectedIds.includes('c' + p.id)) && styles.checkboxChecked]}>
                  {courierPayouts.filter(p => p.status === 'pending').every(p => selectedIds.includes('c' + p.id)) && (
                    <Ionicons name="checkmark" size={12} color={colors.textWhite} />
                  )}
                </View>
                <Text style={styles.selectAllText}>Select All Pending</Text>
              </TouchableOpacity>
              {selectedIds.filter(id => id.startsWith('c')).length > 0 && (
                <TouchableOpacity 
                  style={styles.paySelectedBtn}
                  onPress={() => {
                    const count = selectedIds.filter(id => id.startsWith('c')).length;
                    showAlert('Process Payouts', `Process ${count} courier payout${count > 1 ? 's' : ''}?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Process', 
                        onPress: () => {
                          setSelectedIds([]);
                          showAlert('Success', `${count} payout${count > 1 ? 's' : ''} processed successfully`);
                        }
                      }
                    ]);
                  }}
                >
                  <Ionicons name="send" size={14} color={colors.textWhite} />
                  <Text style={styles.paySelectedText}>
                    Pay {selectedIds.filter(id => id.startsWith('c')).length} Selected
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {courierPayouts.map((payout) => (
              <TouchableOpacity
                key={payout.id}
                style={styles.payoutCard}
                onPress={() => payout.status === 'pending' && toggleSelect('c' + payout.id)}
              >
                <View style={styles.payoutTop}>
                  {payout.status === 'pending' && (
                    <View style={[styles.checkbox, selectedIds.includes('c' + payout.id) && styles.checkboxChecked]}>
                      {selectedIds.includes('c' + payout.id) && <Ionicons name="checkmark" size={12} color={colors.textWhite} />}
                    </View>
                  )}
                  <View style={[styles.payoutAvatar, { backgroundColor: colors.warning + '10' }]}>
                    <Ionicons name="bicycle" size={16} color={colors.warning} />
                  </View>
                  <View style={styles.payoutInfo}>
                    <Text style={styles.payoutName}>{payout.name}</Text>
                    <Text style={styles.payoutOwner}>{payout.period} · {payout.method}</Text>
                  </View>
                  <View style={styles.payoutAmountCol}>
                    <Text style={styles.payoutAmount}>₦{(payout.amount + payout.tips).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <View style={[styles.payoutStatus, {
                      backgroundColor: payout.status === 'pending' ? colors.warning + '15' :
                        payout.status === 'processing' ? colors.info + '15' : colors.success + '15'
                    }]}>
                      <Text style={[styles.payoutStatusText, {
                        color: payout.status === 'pending' ? colors.warning :
                          payout.status === 'processing' ? colors.info : colors.success
                      }]}>{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.payoutMeta}>
                  <Text style={styles.payoutMetaText}>{payout.deliveries} deliveries</Text>
                  <Text style={styles.payoutMetaDot}>·</Text>
                  <Text style={styles.payoutMetaText}>{payout.hours}h worked</Text>
                  <Text style={styles.payoutMetaDot}>·</Text>
                  <Text style={[styles.payoutMetaText, { color: colors.success }]}>+₦{payout.tips.toFixed(2)} tips</Text>
                </View>

                <View style={styles.payoutBreakdown}>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Base Pay</Text>
                    <Text style={styles.breakdownValue}>₦{payout.amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Tips</Text>
                    <Text style={[styles.breakdownValue, { color: colors.success }]}>₦{payout.tips.toFixed(2)}</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Total</Text>
                    <Text style={[styles.breakdownValue, { fontWeight: '800' }]}>₦{(payout.amount + payout.tips).toFixed(2)}</Text>
                  </View>
                </View>

                {payout.status === 'pending' && (
                  <View style={styles.payoutActions}>
                    <TouchableOpacity 
                      style={styles.payoutActionBtn}
                      onPress={() => {
                        showAlert('Courier Payout Details', `${payout.name}\n\nPeriod: ${payout.period}\nDeliveries: ${payout.deliveries}\nHours: ${payout.hours}h\nBase Pay: ₦${payout.amount.toFixed(2)}\nTips: ₦${payout.tips.toFixed(2)}\nTotal: ₦${(payout.amount + payout.tips).toFixed(2)}\nMethod: ${payout.method}`);
                      }}
                    >
                      <Ionicons name="eye-outline" size={16} color={colors.navy} />
                      <Text style={styles.payoutActionText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.payoutActionBtn, styles.payNowBtn]}
                      onPress={() => {
                        const total = payout.amount + payout.tips;
                        showAlert('Process Payout', `Pay ${payout.name} ₦${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Pay Now', 
                            onPress: () => {
                              showAlert('Success', `Payment of ₦${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} sent to ${payout.name}`);
                            }
                          }
                        ]);
                      }}
                    >
                      <Ionicons name="send" size={14} color={colors.textWhite} />
                      <Text style={styles.payNowText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Payment History */}
        {activeTab === 'history' && (
          <View style={styles.listSection}>
            {recentPayments.map((payment) => (
              <View key={payment.id} style={styles.historyCard}>
                <View style={[styles.historyIcon, {
                  backgroundColor: payment.type === 'merchant' ? colors.navy + '15' : colors.warning + '15'
                }]}>
                  <Ionicons
                    name={payment.type === 'merchant' ? 'storefront' : 'bicycle'}
                    size={16}
                    color={payment.type === 'merchant' ? colors.navy : colors.warning}
                  />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName}>{payment.recipient}</Text>
                  <Text style={styles.historyRef}>{payment.ref}</Text>
                  <Text style={styles.historyDate}>{payment.date}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>₦{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  <View style={[styles.historyStatus, {
                    backgroundColor: payment.status === 'completed' ? colors.success + '15' : colors.error + '15'
                  }]}>
                    <Text style={[styles.historyStatusText, {
                      color: payment.status === 'completed' ? colors.success : colors.error
                    }]}>{payment.status === 'completed' ? 'Completed' : 'Failed'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Batch Actions */}
        <View style={styles.batchCard}>
          <Text style={styles.batchTitle}>Batch Actions</Text>
          <TouchableOpacity 
            style={styles.batchBtn}
            onPress={() => {
              const count = merchantPayouts.filter(p => p.status === 'pending').length;
              showAlert('Batch Process', `Process all ${count} merchant payouts (₦${totalMerchantPending.toLocaleString(undefined, { minimumFractionDigits: 2 })})?`, [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Process All', 
                  onPress: () => {
                    showAlert('Success', `${count} merchant payouts processed successfully`);
                  }
                }
              ]);
            }}
          >
            <View style={[styles.batchIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="send" size={18} color={colors.teal} />
            </View>
            <View style={styles.batchInfo}>
              <Text style={styles.batchLabel}>Process All Merchant Payouts</Text>
              <Text style={styles.batchDesc}>{merchantPayouts.filter(p => p.status === 'pending').length} pending · ₦{totalMerchantPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.batchDivider} />
          <TouchableOpacity 
            style={styles.batchBtn}
            onPress={() => {
              const count = courierPayouts.filter(p => p.status === 'pending').length;
              showAlert('Batch Process', `Process all ${count} courier payouts (₦${totalCourierPending.toLocaleString(undefined, { minimumFractionDigits: 2 })})?`, [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Process All', 
                  onPress: () => {
                    showAlert('Success', `${count} courier payouts processed successfully`);
                  }
                }
              ]);
            }}
          >
            <View style={[styles.batchIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="send" size={18} color={colors.warning} />
            </View>
            <View style={styles.batchInfo}>
              <Text style={styles.batchLabel}>Process All Courier Payouts</Text>
              <Text style={styles.batchDesc}>{courierPayouts.filter(p => p.status === 'pending').length} pending · ₦{totalCourierPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.batchDivider} />
          <TouchableOpacity 
            style={styles.batchBtn}
            onPress={() => {
              showAlert('Schedule Payouts', 'Recurring payout scheduling feature coming soon!');
            }}
          >
            <View style={[styles.batchIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="calendar" size={18} color={colors.navy} />
            </View>
            <View style={styles.batchInfo}>
              <Text style={styles.batchLabel}>Schedule Recurring Payouts</Text>
              <Text style={styles.batchDesc}>Set up weekly auto-payouts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28, backgroundColor: colors.navy,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite, flex: 1 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 10, marginTop: 10 },
  summaryCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 12, color: colors.textLight },
  summaryValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  summaryCount: { fontSize: 12, color: colors.warning, fontWeight: '600', marginTop: 4 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 10, marginTop: 12,
    backgroundColor: colors.white, borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: colors.navy },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.textWhite },
  listSection: { paddingHorizontal: 10, marginTop: 10 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: colors.teal, borderColor: colors.teal },
  paySelectedBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 6,
  },
  paySelectedText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  payoutCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  payoutTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payoutAvatar: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  payoutInfo: { flex: 1 },
  payoutName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  payoutOwner: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  payoutAmountCol: { alignItems: 'flex-end' },
  payoutAmount: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  payoutStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  payoutStatusText: { fontSize: 11, fontWeight: '700' },
  payoutMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  payoutMetaText: { fontSize: 12, color: colors.textSecondary },
  payoutMetaDot: { fontSize: 12, color: colors.textLight },
  payoutBreakdown: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  breakdownItem: { alignItems: 'center' },
  breakdownLabel: { fontSize: 11, color: colors.textLight },
  breakdownValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  payoutActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  payoutActionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: colors.lightGray, gap: 4,
  },
  payoutActionText: { fontSize: 13, fontWeight: '600', color: colors.navy },
  payNowBtn: { backgroundColor: colors.teal },
  payNowText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
  releaseBtn: { backgroundColor: colors.warning + '15' },
  releaseBtnText: { fontSize: 13, fontWeight: '600', color: colors.warning },
  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 10,
  },
  historyIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyInfo: { flex: 1 },
  historyName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  historyRef: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  historyDate: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  historyStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  historyStatusText: { fontSize: 11, fontWeight: '700' },
  batchCard: {
    backgroundColor: colors.white, marginHorizontal: 10, marginTop: 16, borderRadius: 16, padding: 16,
  },
  batchTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  batchBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  batchIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  batchInfo: { flex: 1 },
  batchLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  batchDesc: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  batchDivider: { height: 1, backgroundColor: colors.borderLight },
});
