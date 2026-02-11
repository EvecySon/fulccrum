import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { addressesAPI } from '../../services/api';

const getLabelIcon = (label?: string): string => {
  const l = (label || '').toLowerCase();
  if (l.includes('home')) return 'home-outline';
  if (l.includes('work') || l.includes('office')) return 'briefcase-outline';
  if (l.includes('gym') || l.includes('sport')) return 'barbell-outline';
  return 'location-outline';
};

export default function AddressScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [currentLocationText, setCurrentLocationText] = useState('Tap to detect your location');

  // Form state
  const [formLabel, setFormLabel] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPostal, setFormPostal] = useState('');
  const [formCountry, setFormCountry] = useState('Nigeria');
  const [formDefault, setFormDefault] = useState(false);

  const resetForm = () => {
    setFormLabel(''); setFormStreet(''); setFormCity(''); setFormState('');
    setFormPostal(''); setFormCountry('Nigeria'); setFormDefault(false);
    setEditingAddress(null);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await addressesAPI.getAll();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAddresses(data);
    } catch (e: any) {
      if (!isRefresh) Alert.alert('Error', e?.message || 'Could not load addresses');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDetectLocation = async () => {
    setCurrentLocationText('Detecting...');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocationText('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo) {
        const addr = [geo.street, geo.city, geo.region].filter(Boolean).join(', ');
        setCurrentLocationText(addr || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        // Pre-fill form for quick add
        setFormStreet(geo.street || '');
        setFormCity(geo.city || '');
        setFormState(geo.region || '');
        setFormPostal(geo.postalCode || '');
        setFormCountry(geo.country || 'Nigeria');
      }
    } catch (e: any) {
      setCurrentLocationText('Could not detect location');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesAPI.setDefault(id);
      loadData(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not set default');
    }
  };

  const handleDelete = (addr: any) => {
    Alert.alert('Delete Address', `Delete "${addr.label || 'this address'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await addressesAPI.delete(addr.id);
            loadData(true);
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not delete address');
          }
        },
      },
    ]);
  };

  const handleEdit = (addr: any) => {
    setEditingAddress(addr);
    setFormLabel(addr.label || '');
    setFormStreet(addr.streetAddress || '');
    setFormCity(addr.city || '');
    setFormState(addr.state || '');
    setFormPostal(addr.postalCode || '');
    setFormCountry(addr.country || 'Nigeria');
    setFormDefault(addr.isDefault || false);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formStreet.trim()) { Alert.alert('Required', 'Street address is required.'); return; }
    if (!formCity.trim()) { Alert.alert('Required', 'City is required.'); return; }
    if (!formState.trim()) { Alert.alert('Required', 'State is required.'); return; }

    setSaving(true);
    const payload = {
      label: formLabel.trim() || undefined,
      streetAddress: formStreet.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      postalCode: formPostal.trim() || '000000',
      country: formCountry.trim() || 'Nigeria',
      isDefault: formDefault,
    };

    try {
      if (editingAddress) {
        await addressesAPI.update(editingAddress.id, payload);
      } else {
        await addressesAPI.create(payload);
      }
      setShowAddModal(false);
      resetForm();
      loadData(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save address');
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.textLight, marginTop: 12 }}>Loading addresses...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.teal} />}
        >
          {/* Current Location */}
          <TouchableOpacity style={styles.currentLocation} onPress={handleDetectLocation}>
            <View style={styles.currentIcon}>
              <Ionicons name="navigate" size={20} color={colors.teal} />
            </View>
            <View style={styles.currentInfo}>
              <Text style={styles.currentLabel}>Use Current Location</Text>
              <Text style={styles.currentAddress}>{currentLocationText}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>

          {/* Saved Addresses */}
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {addresses.length === 0 ? (
            <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="location-outline" size={36} color={colors.textLight} />
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 8, textAlign: 'center' }}>
                No saved addresses yet. Add one below.
              </Text>
            </View>
          ) : (
            addresses.map((addr: any) => (
              <TouchableOpacity
                key={addr.id}
                style={styles.addressCard}
                onPress={() => !addr.isDefault && handleSetDefault(addr.id)}
                activeOpacity={0.7}
              >
                <View style={styles.addressIcon}>
                  <Ionicons name={getLabelIcon(addr.label) as any} size={20} color={colors.navy} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.addressLabelRow}>
                    <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{addr.streetAddress}</Text>
                  <Text style={styles.addressCity}>
                    {[addr.city, addr.state].filter(Boolean).join(', ')}
                    {addr.postalCode ? ` ${addr.postalCode}` : ''}
                  </Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(addr)}>
                    <Ionicons name="create-outline" size={18} color={colors.navy} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Add New Address */}
          <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowAddModal(true); }}>
            <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
            <Text style={styles.addText}>Add New Address</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Add/Edit Address Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>

              <Text style={styles.inputLabel}>Label (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Home, Work, Gym"
                placeholderTextColor={colors.textLight}
                value={formLabel}
                onChangeText={setFormLabel}
              />

              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                placeholderTextColor={colors.textLight}
                value={formStreet}
                onChangeText={setFormStreet}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Lagos"
                    placeholderTextColor={colors.textLight}
                    value={formCity}
                    onChangeText={setFormCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Lagos"
                    placeholderTextColor={colors.textLight}
                    value={formState}
                    onChangeText={setFormState}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100001"
                    placeholderTextColor={colors.textLight}
                    value={formPostal}
                    onChangeText={setFormPostal}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nigeria"
                    placeholderTextColor={colors.textLight}
                    value={formCountry}
                    onChangeText={setFormCountry}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 8 }}
                onPress={() => setFormDefault(!formDefault)}
              >
                <Ionicons
                  name={formDefault ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={formDefault ? colors.teal : colors.textLight}
                />
                <Text style={{ fontSize: 14, color: colors.textPrimary }}>Set as default address</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.lightGray, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  onPress={() => { setShowAddModal(false); resetForm(); }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.5 : 1 }}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.textWhite} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>
                      {editingAddress ? 'Update' : 'Save'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '90%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.lightGray, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.textPrimary,
  },
});
