import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BILL_CATEGORIES = [
  { id: 'electricity', title: 'Electricity', icon: 'flash', color: '#F59E0B' },
  { id: 'water', title: 'Water', icon: 'water', color: '#0EA5E9' },
  { id: 'internet', title: 'Internet', icon: 'wifi', color: '#8B5CF6' },
  { id: 'cable', title: 'Cable TV', icon: 'tv', color: '#EF4444' },
  { id: 'phone', title: 'Phone', icon: 'call', color: '#10B981' },
  { id: 'gas', title: 'Gas', icon: 'flame', color: '#F97316' },
];

const BillsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Bills</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Select Bill Type</Text>

        <View style={styles.grid}>
          {BILL_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.card}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
                <Ionicons name={category.icon as any} size={32} color={category.color} />
              </View>
              <Text style={styles.cardTitle}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.comingSoon}>
          <Ionicons name="time-outline" size={48} color="#8E8E93" />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Bill payment feature is under development
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default BillsScreen;
