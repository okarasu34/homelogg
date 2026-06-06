import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, SectionLabel } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';

const homeScore = 847;
const energyScore = 78;
const maintenanceScore = 95;
const docsScore = 71;

function energyGrade(s: number) {
  if (s >= 90) return 'A';
  if (s >= 75) return 'B';
  if (s >= 60) return 'C';
  if (s >= 45) return 'D';
  return 'E';
}

export default function HomeScreen() {
  const { t, lang, setLang } = useLang();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t.greeting}, Ahmed 👋</Text>
            <Text style={styles.title}>{t.subtitle}</Text>
            <Text style={styles.tagline}>{t.taglineHome}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setLang(lang === 'no' ? 'en' : 'no')}
            style={styles.langBtn}
          >
            <Text style={styles.langBtnText}>
              {lang === 'no' ? '🇬🇧 EN' : '🇳🇴 NO'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Property Card */}
        <View style={styles.propertyCard}>
          <View style={styles.propertyCardGlow} />
          <View style={styles.propertyCardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.propertyLabel}>{t.primaryProperty}</Text>
              <Text style={styles.propertyAddress}>Ekebergveien 12</Text>
              <Text style={styles.propertyCity}>Oslo, Norge</Text>
              <View style={styles.propertyTags}>
                <Tag label={t.active} color="#fff" bg="rgba(255,255,255,0.18)" />
                <Tag label={t.qrReady} color="#fff" bg="rgba(255,255,255,0.18)" />
              </View>
            </View>
            {/* Score circle */}
            <View style={styles.scoreCircle}>
              <View style={styles.scoreCircleTrack} />
              <View style={styles.scoreCircleInner}>
                <Text style={styles.scoreValue}>{homeScore}</Text>
                <Text style={styles.scoreMax}>/1000</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Repair Alert Banner */}
        <Card style={styles.repairBanner} onPress={() => router.push('/repair')}>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIcon, { backgroundColor: Colors.warn }]}>
              <Text style={{ fontSize: 18 }}>🔨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: Colors.warn }]}>
                {t.repairAlert}
              </Text>
              <Text style={styles.bannerSub}>{t.repairAlertSub}</Text>
            </View>
            <Text style={{ color: Colors.warn, fontSize: 18, fontWeight: '700' }}>›</Text>
          </View>
        </Card>

        {/* Smart Import Banner */}
        <Card
          style={[styles.importBanner, { borderColor: '#d4cef0' }]}
          onPress={() => router.push('/import')}
        >
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIcon, { backgroundColor: Colors.purple }]}>
              <Text style={{ fontSize: 18 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: Colors.purple }]}>
                {t.smartImport}
              </Text>
              <Text style={styles.bannerSub}>{t.smartImportSub}</Text>
            </View>
            <Text style={{ color: Colors.purple, fontSize: 18, fontWeight: '700' }}>›</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <SectionLabel label={t.summary} />
        <View style={styles.grid}>
          {[
            {
              label: t.energyScore,
              value: `${energyScore}/100`,
              grade: energyGrade(energyScore),
              bg: Colors.accentLight,
              color: Colors.accent,
              icon: '⚡',
              route: '/energy',
            },
            {
              label: t.maintenanceScore,
              value: `${maintenanceScore}/100`,
              grade: 'A+',
              bg: Colors.purpleLight,
              color: Colors.purple,
              icon: '🔧',
              route: '/maintenance',
            },
            {
              label: t.documents,
              value: `${docsScore}/100`,
              grade: 'B',
              bg: Colors.goldLight,
              color: Colors.gold,
              icon: '📋',
              route: '/documents',
            },
            {
              label: t.devices,
              value: `4 ${t.registered}`,
              grade: '1 ⚠️',
              bg: Colors.warnLight,
              color: Colors.warn,
              icon: '📱',
              route: '/devices',
            },
          ].map((item, i) => (
            <Card
              key={i}
              style={styles.statCard}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.statCardTop}>
                <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <Text style={[styles.statGrade, { color: item.color }]}>
                  {item.grade}
                </Text>
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {/* Recent Activity */}
        <SectionLabel label={t.recentActivity} />
        {[
          { icon: '🔧', text: t.act1, time: t.daysAgo, dot: Colors.purple },
          { icon: '📄', text: t.act2, time: t.weekAgo, dot: Colors.accent },
          { icon: '⚡', text: t.act3, time: t.weeksAgo, dot: Colors.gold },
        ].map((item, i) => (
          <View key={i} style={styles.activityRow}>
            <View style={styles.activityIcon}>
              <Text style={{ fontSize: 16 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
            <View style={[styles.activityDot, { backgroundColor: item.dot }]} />
          </View>
        ))}

        {/* Settings link */}
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsText}>⚙️ {t.settings}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { color: Colors.textSub, fontSize: 13, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '900', lineHeight: 32 },
  tagline: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  langBtnText: { fontSize: 11, fontWeight: '700', color: Colors.accent },

  propertyCard: {
    background: 'linear-gradient(135deg, #2d6a4f, #1a4a35)',
    backgroundColor: Colors.accent,
    borderRadius: Radius.xxl,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  propertyCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 60,
  },
  propertyCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propertyLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  propertyAddress: { color: Colors.white, fontSize: 17, fontWeight: '700', marginTop: 5, marginBottom: 2 },
  propertyCity: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  propertyTags: { flexDirection: 'row', gap: 6, marginTop: 10 },
  scoreCircle: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreCircleTrack: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  scoreCircleInner: { alignItems: 'center' },
  scoreValue: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  scoreMax: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: '600' },

  repairBanner: {
    marginBottom: 10,
    backgroundColor: Colors.warnLight,
    borderColor: '#f4c99a',
  },
  importBanner: {
    marginBottom: 20,
    backgroundColor: '#f0ecfa',
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  bannerIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 13, fontWeight: '800' },
  bannerSub: { color: Colors.textSub, fontSize: 11, marginTop: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', padding: 14 },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statGrade: { fontSize: 13, fontWeight: '800' },
  statValue: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  statLabel: { color: Colors.textSub, fontSize: 11, marginTop: 2, fontWeight: '500' },

  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  activityIcon: {
    width: 36, height: 36,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  activityTime: { color: Colors.textSub, fontSize: 11 },
  activityDot: { width: 7, height: 7, borderRadius: 4 },

  settingsRow: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  settingsText: { color: Colors.textSub, fontSize: 13, fontWeight: '600' },
});
