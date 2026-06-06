import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '../../src/constants/theme';
import { Card, Tag, SectionLabel, EnergyBar } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';

const energyScore = 78;
const bills = [280, 310, 260, 180, 120, 90, 110, 100, 140, 200, 250, 290];
const maxBill = Math.max(...bills);
const monthsNo = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function energyGrade(s: number) {
  if (s >= 90) return 'A';
  if (s >= 75) return 'B';
  if (s >= 60) return 'C';
  if (s >= 45) return 'D';
  return 'E';
}

export default function EnergyScreen() {
  const { t } = useLang();
  const grade = energyGrade(energyScore);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.energyCard}</Text>
          <Tag label="⚡ Live" color={Colors.accent} bg={Colors.accentLight} />
        </View>

        {/* Grade Banner */}
        <View style={styles.gradeBanner}>
          <View style={styles.gradeBannerRow}>
            <View>
              <Text style={styles.gradeBannerLabel}>{t.energyClass}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 6 }}>
                <Text style={styles.gradeText}>{grade}</Text>
                <Text style={styles.gradeClass}>class</Text>
              </View>
              <Text style={styles.aboveAvg}>{t.aboveAverage}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.annualLabel}>{t.annualEst}</Text>
              <Text style={styles.annualValue}>kr 18 200</Text>
              <Text style={styles.savingsText}>{t.savings}</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <EnergyBar grade={grade} />
          </View>
        </View>

        {/* Live meter */}
        <View style={styles.liveBanner}>
          <Text style={{ fontSize: 18 }}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.liveTitle}>{t.liveData}</Text>
            <Text style={styles.liveSub}>{t.liveDataSub}</Text>
          </View>
        </View>

        {/* Monthly chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t.monthlyBill}</Text>
          <View style={styles.chartBars}>
            {bills.map((bill, i) => (
              <View key={i} style={styles.chartBarCol}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: (bill / maxBill) * 68,
                      backgroundColor: i === new Date().getMonth() ? Colors.accent : Colors.border,
                    },
                  ]}
                />
                <Text style={styles.chartMonth}>{monthsNo[i]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Details */}
        <SectionLabel label={t.details} />
        {[
          { label: t.insulation, value: t.good, score: 80, icon: '🏠' },
          { label: t.heatingSystem, value: '2021 Kjele', score: 85, icon: '🔥' },
          { label: t.doubleGlazing, value: t.yes, score: 90, icon: '🪟' },
          { label: t.solarPanel, value: t.none, score: 0, icon: '☀️' },
        ].map((item, i) => (
          <Card key={i} style={styles.detailCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={[styles.detailValue, { color: item.score > 0 ? Colors.accent : Colors.danger }]}>
                    {item.value}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.score}%` as any, backgroundColor: item.score > 60 ? Colors.accent : Colors.textMuted },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}

        {/* Tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>{t.tip}</Text>
          <Text style={styles.tipText}>{t.tipText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '900' },

  gradeBanner: {
    backgroundColor: '#e8f5ef',
    borderWidth: 1,
    borderColor: '#b8e0cc',
    borderRadius: Radius.xxl,
    padding: 20,
    marginBottom: 14,
  },
  gradeBannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  gradeBannerLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  gradeText: { color: Colors.accent, fontSize: 54, fontWeight: '900', lineHeight: 60 },
  gradeClass: { color: Colors.textSub, fontSize: 14 },
  aboveAvg: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  annualLabel: { color: Colors.textSub, fontSize: 11 },
  annualValue: { color: Colors.text, fontSize: 26, fontWeight: '800' },
  savingsText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },

  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  liveTitle: { color: Colors.accent, fontSize: 12, fontWeight: '800' },
  liveSub: { color: Colors.textSub, fontSize: 11 },

  chartCard: { padding: 18, marginBottom: 20 },
  chartTitle: { color: Colors.textSub, fontSize: 12, fontWeight: '700', marginBottom: 14 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 80 },
  chartBarCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartBar: { width: '100%', borderRadius: 3 },
  chartMonth: { color: Colors.textMuted, fontSize: 8, fontWeight: '600' },

  detailCard: { padding: 14, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  detailLabel: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  detailValue: { fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: '100%', borderRadius: 2 },

  tipBox: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentSoft,
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
  },
  tipTitle: { color: Colors.accent, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  tipText: { color: Colors.textSub, fontSize: 12, lineHeight: 18 },
});
