import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierFleetAPI } from '../../services/api';

interface DeliveryMethod {
  id: string;
  type: string;
  label: string;
  icon: string;
  speedRating: number;
  ecoRating: number;
  costPerKm: number;
  maxDistance: number;
  available: boolean;
  selected: boolean;
}

const mockMethods: DeliveryMethod[] = [
  { id: '1', type: 'bike', label: 'Bicycle', icon: 'bicycle', speedRating: 6, ecoRating: 10, costPerKm: 50, maxDistance: 8000, available: true, selected: false },
  { id: '2', type: 'motorcycle', label: 'Motorcycle', icon: 'bicycle', speedRating: 8, ecoRating: 5, costPerKm: 100, maxDistance: 25000, available: true, selected: true },
  { id: '3', type: 'car', label: 'Car', icon: 'car', speedRating: 9, ecoRating: 3, costPerKm: 150, maxDistance: 50000, available: true, selected: false },
  { id: '4', type: 'electric_scooter', label: 'E-Scooter', icon: 'flash', speedRating: 7, ecoRating: 9, costPerKm: 60, maxDistance: 15000, available: false, selected: false },
  { id: '5', type: 'walking', label: 'Walking', icon: 'walk', speedRating: 3, ecoRating: 10, costPerKm: 30, maxDistance: 3000, available: true, selected: false },
];

const mockVehicleInfo = {
  make: 'Honda',
  model: 'CG 125',
  year: '2023',
  plate: 'LAG-234-XY',
  insurance: 'Valid until Dec 2026',
  lastService: '3 weeks ago',
  mileage: '12,450 km',
};

export default function VehicleManagementScreen({ navigation }: any) {
  const [methods, setMethods] = useState<DeliveryMethod[]>(mockMethods);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await courierFleetAPI.getDeliveryMethods();
      const data = res?.data ?? res;
      setMethods(Array.isArray(data) ? data : mockMethods);
    } catch {
      setMethods(mockMethods);
    } finally { setLoading(false); }
  };

  const selectMethod = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, selected: m.id === id })));
  };

  const renderStars = (rating: number, max: number = 10) => {
    const filled = Math.round((rating / max) * 5);
    return (
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.starDot, i < filled && styles.starDotFilled]} />
        ))}
      </View>
    );
  };

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.teal} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle & Delivery</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Vehicle */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Ionicons name="bicycle" size={28} color={colors.teal} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{mockVehicleInfo.make} {mockVehicleInfo.model}</Text>
              <Text style={styles.vehiclePlate}>{mockVehicleInfo.plate} · {mockVehicleInfo.year}</Text>
            </View>
            <TouchableOpacity style={styles.editVehicleBtn}>
              <Ionicons name="create-outline" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleDetail}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.vehicleDetailText}>{mockVehicleInfo.insurance}</Text>
            </View>
            <View style={styles.vehicleDetail}>
              <Ionicons name="construct" size={14} color={colors.warning} />
              <Text style={styles.vehicleDetailText}>Last service: {mockVehicleInfo.lastService}</Text>
            </View>
            <View style={styles.vehicleDetail}>
              <Ionicons name="speedometer" size={14} color={colors.navy} />
              <Text style={styles.vehicleDetailText}>Mileage: {mockVehicleInfo.mileage}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Methods */}
        <Text style={styles.sectionTitle}>Delivery Methods</Text>
        <Text style={styles.sectionSub}>Select your preferred delivery method</Text>

        {methods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, method.selected && styles.methodSelected, !method.available && styles.methodUnavailable]}
            onPress={() => method.available && selectMethod(method.id)}
            disabled={!method.available}
          >
            <View style={[styles.methodIcon, method.selected && styles.methodIconSelected]}>
              <Ionicons name={method.icon as any} size={24} color={method.selected ? colors.textWhite : colors.textPrimary} />
            </View>
            <View style={styles.methodInfo}>
              <View style={styles.methodNameRow}>
                <Text style={styles.methodName}>{method.label}</Text>
                {!method.available && <Text style={styles.unavailableText}>Coming Soon</Text>}
                {method.selected && <Ionicons name="checkmark-circle" size={18} color={colors.teal} />}
              </View>
              <View style={styles.methodRatings}>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Speed</Text>
                  {renderStars(method.speedRating)}
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Eco</Text>
                  {renderStars(method.ecoRating)}
                </View>
              </View>
              <Text style={styles.methodMeta}>
                ₦{method.costPerKm}/km · Max {(method.maxDistance / 1000).toFixed(0)} km
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Autonomous Section */}
        <View style={styles.autonomousCard}>
          <Ionicons name="hardware-chip" size={32} color={colors.navy} />
          <View style={styles.autonomousInfo}>
            <Text style={styles.autonomousTitle}>Autonomous Delivery</Text>
            <Text style={styles.autonomousDesc}>
              Drone and robot deliveries coming soon to select areas. Join the waitlist to be among the first.
            </Text>
          </View>
          <TouchableOpacity style={styles.waitlistBtn}>
            <Text style={styles.waitlistText}>Join Waitlist</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  vehicleCard: { margin: 16, backgroundColor: colors.white, borderRadius: 20, padding: 20 },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  vehiclePlate: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  editVehicleBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.teal + '10', justifyContent: 'center', alignItems: 'center' },
  vehicleDetails: { gap: 8 },
  vehicleDetail: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleDetailText: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: colors.textLight, marginHorizontal: 16, marginBottom: 12 },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.white, borderRadius: 16, padding: 14, borderWidth: 2, borderColor: 'transparent' },
  methodSelected: { borderColor: colors.teal },
  methodUnavailable: { opacity: 0.5 },
  methodIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center' },
  methodIconSelected: { backgroundColor: colors.teal },
  methodInfo: { flex: 1 },
  methodNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  methodName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  unavailableText: { fontSize: 10, fontWeight: '700', color: colors.warning, backgroundColor: colors.warning + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  methodRatings: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  ratingItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingLabel: { fontSize: 11, color: colors.textLight },
  starsRow: { flexDirection: 'row', gap: 2 },
  starDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  starDotFilled: { backgroundColor: colors.teal },
  methodMeta: { fontSize: 11, color: colors.textLight },
  autonomousCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 12, backgroundColor: colors.navy + '08', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.navy + '20' },
  autonomousInfo: { flex: 1 },
  autonomousTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  autonomousDesc: { fontSize: 12, color: colors.textLight, marginTop: 4, lineHeight: 17 },
  waitlistBtn: { backgroundColor: colors.navy, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  waitlistText: { fontSize: 12, fontWeight: '700', color: colors.textWhite },
});
