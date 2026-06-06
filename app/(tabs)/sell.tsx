import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, SectionLabel } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';

const qrPattern = Array.from({ length: 100 }, () => Math.random() > 0.5);

export default function SellScreen() {
  const { t } = useLang();
  const [qrVisible, setQrVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t.sellMode}</Text>

        {/* Buyer Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGlow} />
          <Text style={styles.summaryLabel}>{t.buyerSummary}</Text>
          <View style={styles.summaryStats}>
            {[
              { val: '847', label: 'HomeScore' },
              { val: 'B', label: t.nav?.energy ?? 'Energy' },
              { val: '4', label: t.maintenanceRecords },
              { val: '5', label: t.documents },
            ].map((s, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={styles.summaryVal}>{s.val}</Text>
                <Text style={styles.summaryStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <Text style={styles.lastUpdated}>{t.lastUpdated}</Text>
        </View>

        {/* QR Code */}
        <Card style={styles.qrCard} onPress={() => setQrVisible(!qrVisible)}>
          {qrVisible ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <View style={styles.qrGrid}>
                {qrPattern.map((on, i) => (
                  <View key={i} style={[styles.qrCell, { backgroundColor: on ? '#1a1916' : 'transparent' }]} />
                ))}
              </View>
              <Text style={styles.qrActive}>{t.qrActive}</Text>
              <Text style={styles.qrActiveSub}>{t.qrActiveSub}</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 44, marginBottom: 8 }}>📱</Text>
              <Text style={styles.qrTitle}>{t.showQr}</Text>
              <Text style={styles.qrSub}>{t.showQrSub}</Text>
            </View>
          )}
        </Card>

        {/* Share Options */}
        <SectionLabel label={t.share} />
        {[
          { icon: '🔗', label: t.copyLink, sub: 'homelog.app/p/oslo-ekebergveien' },
          { icon: '📤', label: t.downloadPdf, sub: t.fullPackage },
          { icon: '📧', label: t.sendAgent, sub: t.sendEmail },
        ].map((item, i) => (
          <Card key={i} style={styles.shareCard} onPress={() => {}}>
            <View style={styles.shareRow}>
              <View style={styles.shareIcon}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shareLabel}>{item.label}</Text>
                <Text style={styles.shareSub}>{item.sub}</Text>
              </View>
              <Text style={{ color: Colors.accent, fontSize: 18, fontWeight: '700' }}>›</Text>
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
  title: { color: Colors.text, fontSize: 22, fontWeight: '900', marginBottom: 20 },

  summaryCard: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.xxl,
    padding: 20,
    marginBottom: 14,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  summaryGlow: {
    position: 'absolute', top: -30, right: -30,
    width: 120, height: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 60,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10, fontWeight: '800',
    letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: 12,
  },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryVal: { color: '#fff', fontSize: 26, fontWeight: '900' },
  summaryStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 10 },
  lastUpdated: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' },

  qrCard: { marginBottom: 20 },
  qrGrid: {
    width: 130, height: 130,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrCell: { width: '10%', aspectRatio: 1, borderRadius: 1 },
  qrActive: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  qrActiveSub: { color: Colors.textSub, fontSize: 11, marginTop: 2 },
  qrTitle: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  qrSub: { color: Colors.textSub, fontSize: 12, textAlign: 'center', marginTop: 4 },

  shareCard: { marginBottom: 8 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  shareIcon: {
    width: 36, height: 36,
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  shareLabel: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  shareSub: { color: Colors.textSub, fontSize: 11 },
});
