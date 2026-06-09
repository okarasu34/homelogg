import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';
import { supabase } from '../src/lib/supabase';
import { ScanResult } from '../src/lib/openai';

const categoryLabels: Record<string, string> = {
  maintenance: 'Vedlikehold',
  renovation: 'Renovering',
  utility: 'Strøm',
  insurance: 'Forsikring',
  other: 'Annet',
};

async function getOrCreateProperty(userId: string) {
  const { data: property } = await supabase.from('properties').select('id').eq('user_id', userId).single();
  if (property) return property.id;
  const { data: newProp } = await supabase.from('properties')
    .insert({ user_id: userId, address: 'Min bolig', city: 'Oslo' })
    .select().single();
  return newProp?.id;
}

export default function ScanResultScreen() {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('maintenance');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    const result = (global as any).__scanResult;
    if (result) {
      setScanResult(result);
      setSelectedCategory(result.category || 'maintenance');
    } else {
      setScanResult({
        type: 'Faktura — Rørleggerservice',
        company: 'Rørlegger Hansen AS',
        date: '14.03.2024',
        amount: 'kr 4 890',
        category: 'maintenance',
        confidence: 97,
      });
    }
  }, []);

  const handleSave = async () => {
    if (!scanResult) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const propertyId = await getOrCreateProperty(user.id);
    if (!propertyId) { setSaving(false); return; }

    const costMatch = scanResult.amount?.match(/[\d\s,.]+/);
    const cost = costMatch ? parseFloat(costMatch[0].replace(/\s/g, '').replace(',', '.')) : null;

    if (selectedCategory === 'utility') {
      // Enerji sekmesine — maintenance_records'a utility olarak kaydet
      await supabase.from('maintenance_records').insert({
        property_id: propertyId,
        title: scanResult.type || 'Strømfaktura',
        date: scanResult.date || new Date().toISOString().split('T')[0],
        cost,
        category: 'utility',
        notes: scanResult.company ? `Leverandør: ${scanResult.company}` : '',
        source: 'scan',
      });
    } else if (selectedCategory === 'insurance') {
      // Dokumenter sekmesine
      await supabase.from('documents').insert({
        property_id: propertyId,
        name: scanResult.company || 'Forsikring',
        type: 'Forsikring',
        date: scanResult.date || new Date().toISOString().split('T')[0],
      });
    } else if (selectedCategory === 'other') {
      // Dokumenter sekmesine
      await supabase.from('documents').insert({
        property_id: propertyId,
        name: scanResult.type || 'Dokument',
        type: 'Annet',
        date: scanResult.date || new Date().toISOString().split('T')[0],
      });
    } else {
      // maintenance / renovation → Vedlikehold
      await supabase.from('maintenance_records').insert({
        property_id: propertyId,
        title: scanResult.type || 'Vedlikehold',
        date: scanResult.date || new Date().toISOString().split('T')[0],
        cost,
        category: selectedCategory,
        notes: scanResult.company ? `Firma: ${scanResult.company}` : '',
        source: 'scan',
      });
    }

    setSaving(false);
    setSaved(true);
    delete (global as any).__scanResult;
  };

  if (!scanResult) return <View style={styles.safe}><ActivityIndicator color={Colors.accent} /></View>;

  if (saved) {
    const destination = ['utility'].includes(selectedCategory)
      ? '/(tabs)/energy'
      : ['insurance', 'other'].includes(selectedCategory)
      ? '/documents'
      : '/maintenance';

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.savedWrap}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.savedTitle}>{t.savedSuccess}</Text>
          <Text style={styles.savedSub}>
            {selectedCategory === 'utility' ? 'Lagt til i Energi' :
             ['insurance','other'].includes(selectedCategory) ? 'Lagt til i Dokumenter' :
             'Lagt til i Vedlikehold'}
          </Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace(destination as any)}>
            <Text style={styles.homeBtnText}>Gå dit →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtnSecondary} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeBtnSecondaryText}>{t.backHome}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.scanSuccess}</Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultCardHeader}>
            <View style={styles.resultIcon}>
              <Text style={{ fontSize: 22 }}>📄</Text>
            </View>
            <View>
              <Text style={styles.aiLabel}>AI OPPDAGET</Text>
              <Text style={styles.resultType}>{scanResult.type}</Text>
            </View>
          </View>
          {[
            { label: t.scanCompany, value: scanResult.company },
            { label: t.scanDate, value: scanResult.date },
            { label: t.scanAmount, value: scanResult.amount },
          ].filter(r => r.value).map((row, i, arr) => (
            <View key={i} style={[styles.resultRow, i < arr.length - 1 && styles.resultRowBorder]}>
              <Text style={styles.resultLabel}>{row.label}</Text>
              <Text style={styles.resultValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Card style={styles.confidenceCard}>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{t.aiConfidence}</Text>
            <Text style={styles.confidenceVal}>{scanResult.confidence}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${scanResult.confidence}%` as any }]} />
          </View>
        </Card>

        <View style={styles.categoryBox}>
          <Text style={styles.categoryTitle}>✏️ {t.categoryLabel}</Text>
          <View style={styles.categoryChips}>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedCategory(key)}
                style={[styles.chip, selectedCategory === key && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedCategory === key && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.categoryHint}>
            {selectedCategory === 'utility' ? '→ Lagres i Energi' :
             ['insurance','other'].includes(selectedCategory) ? '→ Lagres i Dokumenter' :
             '→ Lagres i Vedlikehold'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.rescanBtn} onPress={() => router.replace('/scan')}>
            <Text style={styles.rescanText}>{t.rescan}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>{t.saveRecord} →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  resultCard: { backgroundColor: '#e8f5ef', borderWidth: 1, borderColor: '#b8e0cc', borderRadius: Radius.xl, padding: 20, marginBottom: 14 },
  resultCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  resultIcon: { width: 48, height: 48, backgroundColor: Colors.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aiLabel: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  resultType: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  resultRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' },
  resultLabel: { color: Colors.textSub, fontSize: 13 },
  resultValue: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  confidenceCard: { padding: 14, marginBottom: 16 },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  confidenceLabel: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  confidenceVal: { color: Colors.accent, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  categoryBox: { backgroundColor: Colors.goldLight, borderWidth: 1, borderColor: '#e8d88a', borderRadius: 14, padding: 14, marginBottom: 20 },
  categoryTitle: { color: Colors.gold, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  categoryHint: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  rescanBtn: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  rescanText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  savedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  savedTitle: { color: Colors.accent, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  savedSub: { color: Colors.textSub, fontSize: 14, marginBottom: 24 },
  homeBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, ...Shadow.md, marginBottom: 12 },
  homeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  homeBtnSecondary: { paddingVertical: 10 },
  homeBtnSecondaryText: { color: Colors.textSub, fontSize: 13 },
});