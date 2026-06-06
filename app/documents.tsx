import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, Tag, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';

export default function DocumentsScreen() {
  const { t } = useLang();

  const docs = [
    { id: 1, name: t.titleDeed, date: '2018', icon: '📋', color: Colors.purple },
    { id: 2, name: t.occupancyPermit, date: '2018', icon: '🏛️', color: Colors.blue },
    { id: 3, name: t.earthquakeIns, date: '2025', icon: '🛡️', color: Colors.accent },
    { id: 4, name: t.homeInsurance, date: '2025', icon: '📄', color: Colors.warn },
    { id: 5, name: t.energyCert, date: '2023', icon: '⚡', color: Colors.gold },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.documents}</Text>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.uploadBtnText}>📸 Skann</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{t.completion}</Text>
            <Text style={styles.progressPct}>71%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '71%' }]} />
          </View>
          <Text style={styles.missingDocs}>{t.missingDocs}</Text>
        </Card>

        {/* Docs grid */}
        <View style={styles.grid}>
          {docs.map((doc, i) => (
            <Card key={doc.id} style={styles.docCard} onPress={() => {}}>
              <View style={[styles.docIcon, { backgroundColor: `${doc.color}18` }]}>
                <Text style={{ fontSize: 20 }}>{doc.icon}</Text>
              </View>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docDate}>{doc.date}</Text>
              <Tag
                label={t.available}
                color={Colors.accent}
                bg={Colors.accentLight}
                style={{ marginTop: 7 }}
              />
            </Card>
          ))}

          {/* Add card */}
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => router.push('/scan')}
            activeOpacity={0.7}
          >
            <View style={styles.addIcon}>
              <Text style={{ fontSize: 20 }}>📸</Text>
            </View>
            <Text style={styles.addText}>{t.scanToAdd}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  uploadBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Shadow.sm,
  },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  progressCard: { padding: 14, marginBottom: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  progressPct: { color: Colors.gold, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: 6 },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    // gradient approximation
    backgroundColor: Colors.accent,
  },
  missingDocs: { color: Colors.textMuted, fontSize: 11 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  docCard: { width: '47%', padding: 16 },
  docIcon: {
    width: 40, height: 40,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  docName: { color: Colors.text, fontSize: 12, fontWeight: '700', lineHeight: 16, marginBottom: 3 },
  docDate: { color: Colors.textMuted, fontSize: 10 },

  addCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  addIcon: {
    width: 40, height: 40,
    backgroundColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  addText: { color: Colors.textSub, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
