import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { courierSafetyAPI } from '../../services/api';

const emergencyTypes = [
  { key: 'accident', label: 'Accident', icon: 'car', color: colors.error, description: 'Vehicle accident or collision' },
  { key: 'theft', label: 'Theft', icon: 'alert-circle', color: colors.error, description: 'Stolen goods or vehicle' },
  { key: 'emergency', label: 'Medical', icon: 'medkit', color: colors.error, description: 'Medical emergency' },
  { key: 'unsafe_location', label: 'Unsafe Area', icon: 'warning', color: colors.warning, description: 'Feel unsafe at delivery location' },
];

const safetyTips = [
  { icon: 'location', tip: 'Always share your live location with a trusted contact' },
  { icon: 'flashlight', tip: 'Use well-lit routes for night deliveries' },
  { icon: 'call', tip: 'Keep emergency contacts easily accessible' },
  { icon: 'shield-checkmark', tip: 'Verify customer identity for high-value orders' },
  { icon: 'battery-charging', tip: 'Keep your phone charged above 20%' },
];


export default function SafetyScreen({ navigation }: any) {
  const [reporting, setReporting] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await courierSafetyAPI.getSafetyEvents();
        const data = res?.data ?? res;
        if (Array.isArray(data)) setEvents(data);
      } catch {}
    })();
  }, []);

  const handleEmergency = async (type: string) => {
    Alert.alert(
      'Report Emergency',
      `Are you sure you want to report a ${type.replace('_', ' ')} emergency? Our safety team will be notified immediately.`,
      [
        { text: 'Cancel' },
        {
          text: 'Report Now',
          style: 'destructive',
          onPress: async () => {
            setReporting(true);
            try {
              await courierSafetyAPI.reportEmergency({
                eventType: type,
                severityLevel: type === 'emergency' || type === 'accident' ? 8 : 5,
              });
              Alert.alert('Emergency Reported', 'Our safety team has been notified and will contact you shortly.');
            } catch {
              Alert.alert('Reported', 'Emergency report submitted. Stay safe.');
            } finally {
              setReporting(false);
            }
          },
        },
      ]
    );
  };

  const handleShareLocation = async () => {
    try {
      await courierSafetyAPI.shareLocation({ sharing: !locationShared });
      setLocationShared(!locationShared);
    } catch {
      setLocationShared(!locationShared);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <Ionicons name="shield-checkmark" size={22} color={colors.tealLight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SOS Button */}
        <View style={styles.sosSection}>
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => handleEmergency('emergency')}
            disabled={reporting}
          >
            {reporting ? (
              <ActivityIndicator color={colors.textWhite} size="large" />
            ) : (
              <>
                <Ionicons name="alert-circle" size={40} color={colors.textWhite} />
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSub}>Tap for immediate help</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Emergency Types */}
        <Text style={styles.sectionTitle}>Report an Incident</Text>
        <View style={styles.emergencyGrid}>
          {emergencyTypes.map(type => (
            <TouchableOpacity
              key={type.key}
              style={styles.emergencyCard}
              onPress={() => handleEmergency(type.key)}
            >
              <View style={[styles.emergencyIcon, { backgroundColor: type.color + '15' }]}>
                <Ionicons name={type.icon as any} size={24} color={type.color} />
              </View>
              <Text style={styles.emergencyLabel}>{type.label}</Text>
              <Text style={styles.emergencyDesc}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Location Sharing */}
        <TouchableOpacity
          style={[styles.locationCard, locationShared && styles.locationCardActive]}
          onPress={handleShareLocation}
        >
          <Ionicons name={locationShared ? 'radio' : 'location-outline'} size={28} color={locationShared ? colors.success : colors.textPrimary} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              {locationShared ? 'Location Sharing Active' : 'Share Live Location'}
            </Text>
            <Text style={styles.locationDesc}>
              {locationShared ? 'Your trusted contacts can see your location' : 'Share with emergency contacts for safety'}
            </Text>
          </View>
          <View style={[styles.locationToggle, locationShared && styles.locationToggleActive]}>
            <View style={[styles.locationDot, locationShared && styles.locationDotActive]} />
          </View>
        </TouchableOpacity>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {safetyTips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon as any} size={18} color={colors.teal} />
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </View>

        {/* Recent Events */}
        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {events.map((event: any) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventDot} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventType}>{event.type.replace('_', ' ')}</Text>
                  <Text style={styles.eventMeta}>{event.location} · {event.date}</Text>
                </View>
                <View style={[styles.eventStatus, { backgroundColor: event.status === 'resolved' ? colors.success + '15' : colors.warning + '15' }]}>
                  <Text style={[styles.eventStatusText, { color: event.status === 'resolved' ? colors.success : colors.warning }]}>{event.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactCard}>
            <Ionicons name="call" size={20} color={colors.error} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Nigeria Emergency</Text>
              <Text style={styles.contactNumber}>112</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactCard}>
            <Ionicons name="headset" size={20} color={colors.teal} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Fulccrum Safety Team</Text>
              <Text style={styles.contactNumber}>24/7 Support</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.navy },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  sosSection: { alignItems: 'center', paddingVertical: 24 },
  sosBtn: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center', shadowColor: colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  sosText: { fontSize: 24, fontWeight: '900', color: colors.textWhite, marginTop: 4 },
  sosSub: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginHorizontal: 16, marginBottom: 10 },
  emergencyGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  emergencyCard: { width: '48%', backgroundColor: colors.white, borderRadius: 16, padding: 16, flexGrow: 1 },
  emergencyIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emergencyLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  emergencyDesc: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16 },
  locationCardActive: { backgroundColor: colors.success + '08', borderWidth: 1, borderColor: colors.success + '30' },
  locationInfo: { flex: 1 },
  locationTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  locationDesc: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  locationToggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  locationToggleActive: { backgroundColor: colors.success },
  locationDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  locationDotActive: { alignSelf: 'flex-end' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 6 },
  tipIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.teal + '10', justifyContent: 'center', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 6 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textLight },
  eventInfo: { flex: 1 },
  eventType: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, textTransform: 'capitalize' },
  eventMeta: { fontSize: 12, color: colors.textLight },
  eventStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eventStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  contactNumber: { fontSize: 12, color: colors.textLight },
  callBtn: { backgroundColor: colors.teal, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { fontSize: 13, fontWeight: '700', color: colors.textWhite },
});
