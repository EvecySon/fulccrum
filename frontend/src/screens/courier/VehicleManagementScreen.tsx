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


export default function VehicleManagementScreen({ navigation }: any) {
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await courierFleetAPI.getDeliveryMethods();
      const data = res?.data ?? res;
      if (Array.isArray(data)) setMethods(data);
      // Also try to get vehicle info from performance endpoint
      try {
        const perfRes = await courierFleetAPI.getPerformance();
        const perfData = perfRes?.data ?? perfRes;
        if (perfData?.vehicle) setVehicleInfo(perfData.vehicle);
      } catch {}
    } catch {} finally { setLoading(false); }
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
              <Text style={styles.vehicleName}>{vehicleInfo?.make ? `${vehicleInfo.make} ${vehicleInfo.model}` : 'No vehicle set'}</Text>
              <Text style={styles.vehiclePlate}>{vehicleInfo?.plate ? `${vehicleInfo.plate} · ${vehicleInfo.year || ''}` : 'Add your vehicle details'}</Text>
            </View>
            <TouchableOpacity style={styles.editVehicleBtn}>
              <Ionicons name="create-outline" size={18} color={colors.teal} />
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleDetail}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.vehicleDetailText}>{vehicleInfo?.insurance || 'Insurance not set'}</Text>
            </View>
            <View style={styles.vehicleDetail}>
              <Ionicons name="construct" size={14} color={colors.warning} />
              <Text style={styles.vehicleDetailText}>Last service: {vehicleInfo?.lastService || 'Not recorded'}</Text>
            </View>
            <View style={styles.vehicleDetail}>
              <Ionicons name="speedometer" size={14} color={colors.navy} />
              <Text style={styles.vehicleDetailText}>Mileage: {vehicleInfo?.mileage || 'Not recorded'}</Text>
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
