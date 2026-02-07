import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomerNavigator from './CustomerNavigator';
import MerchantNavigator from './MerchantNavigator';
import CourierNavigator from './CourierNavigator';
import AdminNavigator from './AdminNavigator';

type AppMode = 'customer' | 'merchant' | 'courier' | 'admin';

export default function AppSwitcher() {
  const [mode, setMode] = useState<AppMode>('customer');
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <View style={styles.container}>
      {mode === 'customer' ? <CustomerNavigator /> : mode === 'merchant' ? <MerchantNavigator /> : mode === 'courier' ? <CourierNavigator /> : <AdminNavigator />}

      {/* Floating Mode Switcher Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowSwitcher(!showSwitcher)}
      >
        <Ionicons name="swap-horizontal" size={22} color={colors.textWhite} />
      </TouchableOpacity>

      {/* Mode Switcher Panel */}
      {showSwitcher && (
        <View style={styles.switcherPanel}>
          <Text style={styles.switcherTitle}>Switch App View</Text>
          <TouchableOpacity
            style={[styles.switcherOption, mode === 'customer' && styles.switcherOptionActive]}
            onPress={() => { setMode('customer'); setShowSwitcher(false); }}
          >
            <View style={[styles.switcherIcon, { backgroundColor: colors.teal + '15' }]}>
              <Ionicons name="person" size={20} color={colors.teal} />
            </View>
            <View style={styles.switcherInfo}>
              <Text style={[styles.switcherLabel, mode === 'customer' && styles.switcherLabelActive]}>Customer App</Text>
              <Text style={styles.switcherDesc}>Browse, order, track deliveries</Text>
            </View>
            {mode === 'customer' && <Ionicons name="checkmark-circle" size={22} color={colors.teal} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switcherOption, mode === 'merchant' && styles.switcherOptionActive]}
            onPress={() => { setMode('merchant'); setShowSwitcher(false); }}
          >
            <View style={[styles.switcherIcon, { backgroundColor: colors.navy + '15' }]}>
              <Ionicons name="storefront" size={20} color={colors.navy} />
            </View>
            <View style={styles.switcherInfo}>
              <Text style={[styles.switcherLabel, mode === 'merchant' && styles.switcherLabelActive]}>Merchant App</Text>
              <Text style={styles.switcherDesc}>Manage orders, menu, analytics</Text>
            </View>
            {mode === 'merchant' && <Ionicons name="checkmark-circle" size={22} color={colors.teal} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switcherOption, mode === 'courier' && styles.switcherOptionActive]}
            onPress={() => { setMode('courier'); setShowSwitcher(false); }}
          >
            <View style={[styles.switcherIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="bicycle" size={20} color={colors.warning} />
            </View>
            <View style={styles.switcherInfo}>
              <Text style={[styles.switcherLabel, mode === 'courier' && styles.switcherLabelActive]}>Courier App</Text>
              <Text style={styles.switcherDesc}>Deliver orders, track earnings</Text>
            </View>
            {mode === 'courier' && <Ionicons name="checkmark-circle" size={22} color={colors.teal} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switcherOption, mode === 'admin' && styles.switcherOptionActive]}
            onPress={() => { setMode('admin'); setShowSwitcher(false); }}
          >
            <View style={[styles.switcherIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="shield" size={20} color={colors.error} />
            </View>
            <View style={styles.switcherInfo}>
              <Text style={[styles.switcherLabel, mode === 'admin' && styles.switcherLabelActive]}>Admin Dashboard</Text>
              <Text style={styles.switcherDesc}>Platform management & analytics</Text>
            </View>
            {mode === 'admin' && <Ionicons name="checkmark-circle" size={22} color={colors.teal} />}
          </TouchableOpacity>
        </View>
      )}

      {/* Overlay */}
      {showSwitcher && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSwitcher(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 98,
  },
  switcherPanel: {
    position: 'absolute',
    bottom: 170,
    right: 16,
    left: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 99,
  },
  switcherTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  switcherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
    gap: 12,
  },
  switcherOptionActive: {
    backgroundColor: colors.teal + '10',
    borderWidth: 1.5,
    borderColor: colors.teal + '30',
  },
  switcherOptionDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: colors.lightGray,
    gap: 12,
    opacity: 0.5,
  },
  switcherIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switcherInfo: {
    flex: 1,
  },
  switcherLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  switcherLabelActive: {
    color: colors.teal,
    fontWeight: '700',
  },
  switcherLabelDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  switcherDesc: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  comingSoonBadge: {
    backgroundColor: colors.darkGray + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkGray,
  },
});
