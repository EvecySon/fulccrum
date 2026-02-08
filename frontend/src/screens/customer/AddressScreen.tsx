import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { addressesAPI } from '../../services/api';

const mockAddresses = [
  { id: '1', label: 'Home', address: '123 Main Street, Apt 4B', city: 'New York, NY 10001', icon: 'home', isDefault: true },
  { id: '2', label: 'Work', address: '456 Business Ave, Floor 12', city: 'New York, NY 10018', icon: 'briefcase', isDefault: false },
  { id: '3', label: 'Gym', address: '789 Fitness Blvd', city: 'New York, NY 10003', icon: 'barbell', isDefault: false },
];

export default function AddressScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState(mockAddresses);

  useEffect(() => {
    (async () => {
      try {
        const res = await addressesAPI.getAll();
        if (res?.length) setAddresses(res);
      } catch {}
    })();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Current Location */}
        <TouchableOpacity style={styles.currentLocation}>
          <View style={styles.currentIcon}>
            <Ionicons name="navigate" size={20} color={colors.teal} />
          </View>
          <View style={styles.currentInfo}>
            <Text style={styles.currentLabel}>Use Current Location</Text>
            <Text style={styles.currentAddress}>Detecting your location...</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>

        {/* Saved Addresses */}
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        {addresses.map((addr) => (
          <View key={addr.id} style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name={addr.icon as any} size={20} color={colors.navy} />
            </View>
            <View style={styles.addressInfo}>
              <View style={styles.addressLabelRow}>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{addr.address}</Text>
              <Text style={styles.addressCity}>{addr.city}</Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="create-outline" size={18} color={colors.navy} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add New Address */}
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
          <Text style={styles.addText}>Add New Address</Text>
        </TouchableOpacity>

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={40} color={colors.textLight} />
            <Text style={styles.mapText}>Map Preview</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16,
    marginTop: 10, marginHorizontal: 10, borderRadius: 28,
    backgroundColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  content: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  currentLocation: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal + '08',
    borderRadius: 16, padding: 16, marginBottom: 20, gap: 12,
    borderWidth: 1.5, borderColor: colors.teal + '25',
  },
  currentIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.teal + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  currentInfo: { flex: 1 },
  currentLabel: { fontSize: 15, fontWeight: '700', color: colors.teal },
  currentAddress: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  addressCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, gap: 12,
  },
  addressIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  addressInfo: { flex: 1 },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: { backgroundColor: colors.teal + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  addressText: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  addressCity: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  addressActions: { justifyContent: 'center', gap: 8 },
  actionBtn: { padding: 4 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.teal + '08', borderRadius: 16, padding: 16, marginTop: 8, gap: 8,
    borderWidth: 1.5, borderColor: colors.teal + '25', borderStyle: 'dashed',
  },
  addText: { fontSize: 15, fontWeight: '600', color: colors.teal },
  mapPreview: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  mapPlaceholder: {
    height: 160, backgroundColor: colors.white, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  mapText: { fontSize: 14, color: colors.textLight },
});
