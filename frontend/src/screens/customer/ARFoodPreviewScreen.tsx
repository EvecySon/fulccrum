import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { arAPI } from '../../services/api';

interface ARModel {
  id: string;
  name: string;
  image: string;
  arModelUrl: string;
  calories: number;
  servingSize: string;
  allergens: string[];
}

export default function ARFoodPreviewScreen({ navigation, route }: any) {
  const itemId = route?.params?.itemId;
  const [arItems, setArItems] = useState<ARModel[]>([]);
  const [selectedItem, setSelectedItem] = useState<ARModel | null>(null);
  const [arActive, setArActive] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await arAPI.getAvailableModels();
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setArItems(data);
        if (data.length > 0) setSelectedItem(data[0]);
      } catch { /* AR models optional */ }
    })();
  }, []);

  const handleActivateAR = async () => {
    setLoading(true);
    try {
      if (itemId) await arAPI.getFoodPreview(itemId);
    } catch (e: any) { Alert.alert('Error', e?.message || 'Something went wrong'); }
    setTimeout(() => {
      setLoading(false);
      setArActive(true);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AR Food Preview</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* AR Viewport */}
      <View style={styles.arViewport}>
        {arActive ? (
          <View style={styles.arActiveView}>
            <Image source={{ uri: selectedItem?.image }} style={styles.arImage} />
            <View style={styles.arOverlay}>
              <View style={styles.arBadge}>
                <Ionicons name="cube-outline" size={14} color={colors.textWhite} />
                <Text style={styles.arBadgeText}>AR Active</Text>
              </View>
              <Text style={styles.arHint}>Pinch to resize · Drag to move</Text>
            </View>
            {/* Nutrition overlay */}
            <View style={styles.nutritionOverlay}>
              <Text style={styles.nutritionTitle}>{selectedItem?.name}</Text>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionItem}>
                  <Ionicons name="flame" size={14} color={colors.warning} />
                  <Text style={styles.nutritionValue}>{selectedItem?.calories} cal</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Ionicons name="resize" size={14} color={colors.teal} />
                  <Text style={styles.nutritionValue}>{selectedItem?.servingSize}</Text>
                </View>
              </View>
              {(selectedItem?.allergens?.length ?? 0) > 0 && (
                <View style={styles.allergenRow}>
                  <Ionicons name="warning" size={12} color={colors.error} />
                  <Text style={styles.allergenText}>{selectedItem?.allergens?.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.arPlaceholder}>
            <Ionicons name="cube-outline" size={64} color={colors.textLight} />
            <Text style={styles.arPlaceholderTitle}>AR Food Preview</Text>
            <Text style={styles.arPlaceholderSub}>See how your food looks in real size before ordering</Text>
            <TouchableOpacity style={styles.activateBtn} onPress={handleActivateAR} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <>
                  <Ionicons name="camera" size={20} color={colors.textWhite} />
                  <Text style={styles.activateBtnText}>Activate AR Camera</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Item Selector */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>Select a dish to preview</Text>
        {arItems.length === 0 && !loading && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 13, color: colors.textLight }}>No dishes available for AR preview yet.</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {arItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.selectorCard, selectedItem?.id === item.id && styles.selectorCardActive]}
              onPress={() => { setSelectedItem(item); setArActive(false); }}
            >
              <Image source={{ uri: item.image }} style={styles.selectorImage} />
              <Text style={[styles.selectorName, selectedItem?.id === item.id && styles.selectorNameActive]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Add to Cart */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Ionicons name="cart" size={20} color={colors.textWhite} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.lightGray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  arViewport: { flex: 1, margin: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.darkGray },
  arPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  arPlaceholderTitle: { fontSize: 20, fontWeight: '700', color: colors.textWhite, marginTop: 16 },
  arPlaceholderSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  activateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.teal, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  activateBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  arActiveView: { flex: 1 },
  arImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  arOverlay: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.teal, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  arBadgeText: { fontSize: 12, fontWeight: '700', color: colors.textWhite },
  arHint: { fontSize: 11, color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  nutritionOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 14, padding: 14 },
  nutritionTitle: { fontSize: 16, fontWeight: '700', color: colors.textWhite, marginBottom: 8 },
  nutritionRow: { flexDirection: 'row', gap: 16 },
  nutritionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nutritionValue: { fontSize: 13, fontWeight: '600', color: colors.textWhite },
  allergenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  allergenText: { fontSize: 12, color: colors.error, fontWeight: '600' },
  selectorSection: { paddingHorizontal: 16, paddingBottom: 8 },
  selectorTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  selectorRow: { gap: 10 },
  selectorCard: { width: 100, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 2, borderColor: 'transparent' },
  selectorCardActive: { borderColor: colors.teal },
  selectorImage: { width: 100, height: 70 },
  selectorName: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, padding: 6, textAlign: 'center' },
  selectorNameActive: { color: colors.teal },
  footer: { padding: 16, paddingBottom: 34, backgroundColor: colors.white },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16 },
  addToCartText: { fontSize: 16, fontWeight: '700', color: colors.textWhite },
});
