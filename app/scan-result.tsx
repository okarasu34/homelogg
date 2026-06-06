import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, Tag, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';

export default function ScanResultScreen() {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);

  if (saved) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.savedWrap}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.savedTitle}>{t.savedSuccess}</Text>
          <Text style={styles.savedSub}>Vedlikeholdspoeng oppdatert</Text>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>{t.backHome}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.scanSuccess}</Text>
        </View>

        {/* Scanned result */}
        <View style={styles.resultCard}>
          <View style={styles.resultCardHeader}>
            <View style={styles.resultIcon}>
              <Text style={{ fontSize: 22 }}>📄</Text>
            </View>
            <View>
              <Text style={styles.aiLabel}>AI DETECTED</Text>
              <Text style={styles.resultType}>{t.scanType}</Text>
            </View>
          </View>
          {[
            { label: t.scanCompany, value: t.scanCompanyVal },
            { label: t.scanDate, value: t.scanDateVal },
            { label: t.scanAmount, value: t.scanAmountVal },
            { label: t.scanCategory, value: t.scanCategoryVal },
          ].map((row, i) => (
            <View key={i} style={[styles.resultRow, i < 3 && styles.resultRowBorder]}>
              <Text style={styles.resultLabel}>{row.label}</Text>
              <Text style={styles.resultValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Confidence */}
        <Card style={styles.confidenceCard}>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{t.aiConfidence}</Text>
            <Text style={styles.confidenceVal}>97%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '97%' }]} />
          </View>
        </Card>

        {/* Category selector */}
        <View style={styles.categoryBox}>
          <Text style={styles.categoryTitle}>✏️ {t.categoryLabel}</Text>
          <View style={styles.categoryChips}>
            {t.categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCategory(i)}
                style={[
                  styles.chip,
                  selectedCategory === i && styles.chipActive,
                ]}
              >
                <Text style={[
                  styles.chipText,
                  selectedCategory === i && styles.chipTextActive,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rescanBtn}
            onPress={() => router.replace('/scan')}
          >
            <Text style={styles.rescanText}>{t.rescan}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => setSaved(true)}
          >
            <Text style={styles.saveBtnText}>{t.saveRecord} →</Text>
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

  resultCard: {
    backgroundColor: '#e8f5ef',
    borderWidth: 1,
    borderColor: '#b8e0cc',
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 14,
  },
  resultCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  resultIcon: {
    width: 48, height: 48,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
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

  categoryBox: {
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: '#e8d88a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  categoryTitle: { color: Colors.gold, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  actions: { flexDirection: 'row', gap: 10 },
  rescanBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rescanText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.md,
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  savedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  savedTitle: { color: Colors.accent, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  savedSub: { color: Colors.textSub, fontSize: 14, marginBottom: 32 },
  homeBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, ...Shadow.md },
  homeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
