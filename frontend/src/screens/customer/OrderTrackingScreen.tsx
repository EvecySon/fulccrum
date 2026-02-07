import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { mockOrders } from '../../data/mockData';

const order = mockOrders[0];

const stages = [
  { key: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { key: 'picked_up', label: 'Picked Up', icon: 'bag-check' },
  { key: 'in_transit', label: 'On the Way', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

const currentStageIndex = 3;

export default function OrderTrackingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order {order.id}</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={colors.textWhite} />
        </TouchableOpacity>
      </View>

      {/* ETA Banner */}
      <View style={styles.etaBanner}>
        <Text style={styles.etaLabel}>Estimated Arrival</Text>
        <Text style={styles.etaTime}>{order.eta}</Text>
        <Text style={styles.etaSubtext}>Your food is on its way!</Text>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={60} color={colors.teal + '40'} />
        <Text style={styles.mapText}>Live Map Tracking</Text>
        <View style={styles.routeLine}>
          <View style={styles.routeDot}>
            <Ionicons name="restaurant" size={16} color={colors.textWhite} />
          </View>
          <View style={styles.routeDash} />
          <View style={styles.routeDash} />
          <View style={styles.routeDash} />
          <View style={[styles.routeDot, { backgroundColor: colors.navy }]}>
            <Ionicons name="location" size={16} color={colors.textWhite} />
          </View>
        </View>
      </View>

      {/* Progress Stages */}
      <View style={styles.progressSection}>
        {stages.map((stage, index) => (
          <View key={stage.key} style={styles.stageRow}>
            <View style={styles.stageIndicator}>
              <View
                style={[
                  styles.stageDot,
                  index <= currentStageIndex && styles.stageDotActive,
                  index === currentStageIndex && styles.stageDotCurrent,
                ]}
              >
                <Ionicons
                  name={stage.icon as any}
                  size={16}
                  color={
                    index <= currentStageIndex
                      ? colors.textWhite
                      : colors.textLight
                  }
                />
              </View>
              {index < stages.length - 1 && (
                <View
                  style={[
                    styles.stageLine,
                    index < currentStageIndex && styles.stageLineActive,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.stageLabel,
                index <= currentStageIndex && styles.stageLabelActive,
                index === currentStageIndex && styles.stageLabelCurrent,
              ]}
            >
              {stage.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Driver Info */}
      <View style={styles.driverSection}>
        <Image
          source={{ uri: order.driverAvatar }}
          style={styles.driverAvatar}
        />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{order.driverName}</Text>
          <View style={styles.driverRating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.driverRatingText}>{order.driverRating}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.driverAction}>
          <Ionicons name="chatbubble-ellipses" size={22} color={colors.teal} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.driverAction}>
          <Ionicons name="call" size={22} color={colors.teal} />
        </TouchableOpacity>
      </View>

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <Text style={styles.detailsTitle}>{order.restaurantName}</Text>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.detailsItem}>
            • {item}
          </Text>
        ))}
        <View style={styles.detailsTotal}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₦{order.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.navy,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  etaBanner: {
    backgroundColor: colors.navy,
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  etaLabel: {
    fontSize: 13,
    color: colors.tealLight,
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textWhite,
  },
  etaSubtext: {
    fontSize: 14,
    color: colors.tealLight,
    marginTop: 4,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    marginBottom: 16,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDash: {
    width: 30,
    height: 3,
    backgroundColor: colors.teal + '40',
    borderRadius: 2,
  },
  progressSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stageIndicator: {
    alignItems: 'center',
  },
  stageDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageDotActive: {
    backgroundColor: colors.teal,
  },
  stageDotCurrent: {
    backgroundColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stageLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.lightGray,
    marginVertical: 2,
  },
  stageLineActive: {
    backgroundColor: colors.teal,
  },
  stageLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
  },
  stageLabelActive: {
    color: colors.textSecondary,
  },
  stageLabelCurrent: {
    fontWeight: '700',
    color: colors.teal,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  driverAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  detailsItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.teal,
  },
});
