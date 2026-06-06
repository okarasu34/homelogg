import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, Tag, BackButton, SectionLabel } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';

export default function MaintenanceScreen() {
  const { t } = useLang();

  const data = [
    { id: 1, title: t.roofRepair, date: 'Mar 2024', cost: 'kr 12 000', icon: '🏚️', source: '📸 Skannet' },
    { id: 2, title: t.interiorPaint, date: 'Jan 2024', cost: 'kr 6 500', icon: '🎨', source: '📧 E-post' },
    { id: 3, title: t.plumbingRenewal, date: 'Nov 2023', cost: 'kr 8 900', icon: '🔧', source: '🏦 Bank' },
    { id: 4, title: t.flooringWork, date: 'Aug 2023', cost: 'kr 21 000', icon: '🪵', source: '📸 Skannet' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.maintenanceHistory}</Text>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanBtnText}>📸 Skann</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          {[
            { label: t.records, value: '4', color: Colors.purple },
            { label: t.total, value: 'kr 48 400', color: Colors.accent },
            { label: t.score, value: '95', color: Colors.gold },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Card>

        {/* Records */}
        {data.map((item, i) => (
          <Card key={item.id} style={styles.record}>
            <View style={styles.recordRow}>
              <View style={styles.recordIcon}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.recordTopRow}>
                  <Text style={styles.recordTitle}>{item.title}</Text>
                  <Text style={styles.recordCost}>{item.cost}</Text>
                </View>
                <View style={styles.recordBottomRow}>
                  <Text style={styles.recordDate}>{item.date}</Text>
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Tag label={item.source} color={Colors.purple} bg={Colors.purpleLight} />
                    <Tag label={t.completed} color={Colors.accent} bg={Colors.accentLight} />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  scanBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Shadow.sm,
  },
  scanBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  statsCard: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },

  record: { padding: 16, marginBottom: 10 },
  recordRow: { flexDirection: 'row', gap: 14 },
  recordIcon: {
    width: 48, height: 48,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  recordTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recordTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  recordCost: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  recordBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { color: Colors.textSub, fontSize: 12 },
});
