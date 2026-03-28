import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { aiAPI, searchAPI } from '../../services/api';
import { normalizeRestaurant } from '../../services/mockApi';

interface VoiceResult {
  intent: string;
  items: string[];
  restaurant?: string;
  confidence: number;
  suggestedAction?: string;
}

export default function VoiceOrderingScreen({ navigation }: any) {
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState('');

  const suggestions = [
    'Order my usual from Mama\'s Kitchen',
    'Get me a shawarma and chapman',
    'Reorder my last meal',
    'Find restaurants near me with jollof rice',
    'What\'s trending today?',
  ];

  const [textInput, setTextInput] = useState('');

  const handleStartListening = async () => {
    setIsListening(true);
    setError('');
    setResult(null);
    setTranscript('');

    // Use Web Speech API on browser
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsListening(false);
        Alert.alert('Not Supported', 'Speech recognition is not supported in this browser. Use the text input below instead.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setIsListening(false);
        setTranscript(spokenText);
        handleProcessVoice(spokenText);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          Alert.alert('No Speech', 'No speech was detected. Please try again.');
        } else {
          Alert.alert('Speech Error', `Could not recognize speech: ${event.error}`);
        }
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } else {
      // Native fallback — no real speech recognition without native module
      Alert.alert('Use Text Input', 'Voice recognition requires a browser. Please type your order below.');
      setIsListening(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    setTranscript(textInput.trim());
    handleProcessVoice(textInput.trim());
    setTextInput('');
  };

  const handleProcessVoice = async (text: string) => {
    setProcessing(true);
    try {
      const data = await aiAPI.processVoiceCommand(text);
      // Map backend shape to frontend shape
      setResult({
        intent: data?.intent || 'order',
        items: data?.parsedItems || data?.items || [],
        restaurant: data?.restaurant || undefined,
        confidence: data?.confidence || 0.9,
        suggestedAction: data?.suggestedAction,
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not process voice command');
      setResult(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setTranscript(text);
    handleProcessVoice(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mic Area */}
        <View style={styles.micArea}>
          <TouchableOpacity
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={handleStartListening}
            disabled={isListening || processing}
          >
            <Ionicons
              name={isListening ? 'radio' : 'mic'}
              size={48}
              color={isListening ? colors.error : colors.textWhite}
            />
          </TouchableOpacity>
          {isListening && (
            <View style={styles.listeningIndicator}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
            </View>
          )}
          <Text style={styles.micLabel}>
            {isListening ? 'Listening...' : processing ? 'Processing...' : 'Tap to speak'}
          </Text>
        </View>

        {/* Transcript */}
        {transcript !== '' && (
          <View style={styles.transcriptCard}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.teal} />
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        )}

        {/* Processing */}
        {processing && (
          <View style={styles.processingCard}>
            <ActivityIndicator color={colors.teal} />
            <Text style={styles.processingText}>Understanding your order...</Text>
          </View>
        )}

        {/* Result */}
        {result && !processing && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.resultTitle}>Got it!</Text>
              <Text style={styles.resultConfidence}>{Math.round(result.confidence * 100)}% confident</Text>
            </View>
            <View style={styles.resultBody}>
              <Text style={styles.resultLabel}>Intent</Text>
              <Text style={styles.resultValue}>{result.intent}</Text>
              {result.restaurant && (
                <>
                  <Text style={styles.resultLabel}>Restaurant</Text>
                  <Text style={styles.resultValue}>{result.restaurant}</Text>
                </>
              )}
              {result.items.length > 0 && (
                <>
                  <Text style={styles.resultLabel}>Items</Text>
                  <View style={styles.itemChips}>
                    {result.items.map((item, i) => (
                      <View key={i} style={styles.itemChip}>
                        <Text style={styles.itemChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {result.suggestedAction && (
                <>
                  <Text style={styles.resultLabel}>Suggestion</Text>
                  <Text style={styles.resultValue}>{result.suggestedAction}</Text>
                </>
              )}
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setResult(null)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={async () => {
                try {
                  const searchTerm = result.restaurant || result.items.join(' ') || transcript;
                  const res: any = await searchAPI.searchBusinesses(searchTerm);
                  const businesses = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

                  if (businesses.length > 0) {
                    // Found a matching restaurant — normalize shape and go straight to it
                    navigation.navigate('Restaurant', {
                      restaurant: normalizeRestaurant(businesses[0]),
                      highlightItem: result.items[0] || null,
                    });
                  } else {
                    // Nothing found — fall back to search with the term pre-filled
                    Alert.alert(
                      'Restaurant Not Found',
                      `We couldn't find "${result.restaurant || searchTerm}" nearby. Showing search results instead.`,
                      [{ text: 'OK', onPress: () => navigation.navigate('Search', { query: searchTerm }) }]
                    );
                  }
                } catch {
                  navigation.navigate('Search', { query: result.restaurant || result.items.join(' ') || transcript });
                }
              }}>
                <Text style={styles.confirmBtnText}>Find Items</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Text Input Fallback */}
        {!processing && !isListening && (
          <View style={styles.textInputSection}>
            <Text style={styles.textInputLabel}>Or type your order</Text>
            <View style={styles.textInputRow}>
              <TextInput
                style={styles.textInputField}
                placeholder="e.g. Get me 2 shawarmas..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={handleTextSubmit}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.textSendBtn} onPress={handleTextSubmit} disabled={!textInput.trim()}>
                <Ionicons name="send" size={20} color={textInput.trim() ? colors.teal : 'rgba(255,255,255,0.2)'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Suggestions */}
        {!result && !processing && !isListening && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>Try saying...</Text>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionCard} onPress={() => handleSuggestion(s)}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.teal} />
                <Text style={styles.suggestionText}>"{s}"</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textWhite },
  content: { paddingBottom: 100 },
  micArea: { alignItems: 'center', paddingVertical: 40 },
  micBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center', shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  micBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)', shadowColor: colors.error },
  listeningIndicator: { flexDirection: 'row', gap: 6, marginTop: 20 },
  wave: { width: 4, borderRadius: 2, backgroundColor: colors.teal },
  wave1: { height: 16 },
  wave2: { height: 28 },
  wave3: { height: 20 },
  micLabel: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 16 },
  transcriptCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 16 },
  transcriptText: { flex: 1, fontSize: 15, color: colors.textWhite, fontStyle: 'italic' },
  processingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', padding: 20 },
  processingText: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  resultCard: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  resultConfidence: { fontSize: 12, fontWeight: '600', color: colors.teal },
  resultBody: { padding: 16 },
  resultLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight, marginBottom: 4, marginTop: 10 },
  resultValue: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  itemChip: { backgroundColor: colors.teal + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  itemChipText: { fontSize: 13, fontWeight: '600', color: colors.teal },
  resultActions: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: colors.borderLight },
  editBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.lightGray },
  editBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  confirmBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 14, backgroundColor: colors.teal },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: colors.textWhite },
  textInputSection: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  textInputLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  textInputRow: { flexDirection: 'row', gap: 10 },
  textInputField: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textWhite },
  textSendBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  suggestionsSection: { paddingHorizontal: 20, marginTop: 8 },
  suggestionsTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 12 },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 8 },
  suggestionText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});
