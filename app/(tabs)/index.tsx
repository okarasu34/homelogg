import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, SectionLabel } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';
import { supabase } from '../../src/lib/supabase';

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
  const [firstName, setFirstName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [boligType, setBoligType] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || user.email?.split('@')[0] || '';
        setFirstName(fullName.split(' ')[0]);
        setAddress(meta.address || '');
        setCity(meta.postanummer ? `${meta.postanummer} Oslo` : 'Norge');
        setBoligType(meta.bolig_type || '');
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.headerTop}>
          <Text style={styles.greeting}>{t.greeting}, {firstName} 👋</Text>
          <View style={styles.headerBtns}>
            <View style={styles.langToggle}>
              <TouchableOpacity onPress={() => setLang('no')} style={[styles.langPill, lang === 'no' && styles.langPillActive]}>
                <Text style={[styles.langPillText, lang === 'no' && styles.langPillTextActive]}>🇳🇴 NO</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLang('en')} style={[styles.langPill, lang === 'en' && styles.langPillActive]}>
                <Text style={[styles.langPillText, lang === 'en' && styles.langPillTextActive]}>🇬🇧 EN</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={[styles.iconBtn, styles.signOutBtn]}>
              <Text style={styles.iconBtnText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <View style={styles.logoRoof} />
            <View style={styles.logoBodyLeft} />
            <View style={styles.logoBodyRight} />
            <View style={styles.logoDoor} />
          </View>
          <View>
            <Text style={styles.title}>{t.subtitle}</Text>
            <Text style={styles.tagline}>{t.taglineHome}</Text>
          </View>
        </View>

        <View style={styles.propertyCard}>
          <View style={styles.propertyCardGlow} />
          <View style={styles.propertyCardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.propertyLabel}>{t.primaryProperty}</Text>
              <Text style={styles.propertyAddress}>{address || 'Legg til adresse'}</Text>
              <Text style={styles.propertyCity}>{city}</Text>
              <View style={styles.propertyTags}>
                <Tag label={t.active} color="#fff" bg="rgba(255,255,255,0.18)" />
                <Tag label={boligType || t.qrReady} color="#fff" bg="rgba(255,255,255,0.18)" />
              </View>
            </View>
            <View style={styles.scoreCircle}>
              <View style={styles.scoreCircleTrack} />
              <View style={styles.scoreCircleInner}>
                <Text style={styles.scoreValue}>{homeScore}</Text>
                <Text style={styles.scoreMax}>/1000</Text>
              </View>
            </View>
          </View>
        </View>

        <Card style={styles.repairBanner} onPress={() => router.push('/repair')}>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIcon, { backgroundColor: Colors.warn }]}>
              <Text style={{ fontSize: 18 }}>🔨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: Colors.warn }]}>{t.repairAlert}</Text>
              <Text style={styles.bannerSub}>{t.repairAlertSub}</Text>
            </View>
            <Text style={{ color: Colors.warn, fontSize: 18, fontWeight: '700' }}>›</Text>
          </View>
        </Card>

        <Card style={[styles.importBanner, { borderColor: '#f6bfa0' }]} onPress={() => router.push('/import')}>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIcon, { backgroundColor: Colors.orange }]}>
              <Text style={{ fontSize: 18 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: Colors.orange }]}>{t.smartImport}</Text>
              <Text style={styles.bannerSub}>{t.smartImportSub}</Text>
            </View>
            <Text style={{ color: Colors.orange, fontSize: 18, fontWeight: '700' }}>›</Text>
          </View>
        </Card>

        <SectionLabel label={t.summary} />
        <View style={styles.grid}>
          {[
            { label: t.energyScore, value: `${energyScore}/100`, grade: energyGrade(energyScore), bg: Colors.accentLight, color: Colors.accent, icon: '⚡', route: '/energy' },
            { label: t.maintenanceScore, value: `${maintenanceScore}/100`, grade: 'A+', bg: Colors.orangeLight, color: Colors.orange, icon: '🔧', route: '/maintenance' },
            { label: t.documents, value: `${docsScore}/100`, grade: 'B', bg: Colors.goldLight, color: Colors.gold, icon: '📋', route: '/documents' },
            { label: t.devices, value: `4 ${t.registered}`, grade: '1 ⚠️', bg: Colors.warnLight, color: Colors.warn, icon: '📱', route: '/devices' },
          ].map((item, i) => (
            <Card key={i} style={styles.statCard} onPress={() => router.push(item.route as any)}>
              <View style={styles.statCardTop}>
                <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <Text style={[styles.statGrade, { color: item.color }]}>{item.grade}</Text>
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        <SectionLabel label={t.recentActivity} />
        {[
          { icon: '🔧', text: t.act1, time: t.daysAgo, dot: Colors.orange },
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

        <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/settings')}>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting: { color: Colors.textSub, fontSize: 13, fontWeight: '600', flex: 1 },
  langToggle: { flexDirection: 'row', borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.accent, overflow: 'hidden' },
  langPill: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'transparent' },
  langPillActive: { backgroundColor: Colors.accent },
  langPillText: { fontSize: 10, fontWeight: '700', color: Colors.accent },
  langPillTextActive: { color: '#fff' },
  iconBtn: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  signOutBtn: { backgroundColor: Colors.dangerLight, borderColor: '#f5c5c0' },
  iconBtnText: { fontSize: 15 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', position: 'relative', ...Shadow.sm },
  logoRoof: { position: 'absolute', top: 0, left: 0, right: 0, height: 22, backgroundColor: Colors.accent, borderTopLeftRadius: 11, borderTopRightRadius: 11 },
  logoBodyLeft: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 26, backgroundColor: '#e8610a' },
  logoBodyRight: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 26, backgroundColor: Colors.accent },
  logoDoor: { position: 'absolute', bottom: 0, left: 17, width: 14, height: 16, backgroundColor: Colors.white, borderTopLeftRadius: 7, borderTopRightRadius: 7 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '900', lineHeight: 28 },
  tagline: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  propertyCard: { backgroundColor: Colors.accent, borderRadius: Radius.xxl, padding: 20, marginBottom: 14, overflow: 'hidden', ...Shadow.lg },
  propertyCardGlow: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 60 },
  propertyCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propertyLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  propertyAddress: { color: Colors.white, fontSize: 17, fontWeight: '700', marginTop: 5, marginBottom: 2 },
  propertyCity: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  propertyTags: { flexDirection: 'row', gap: 6, marginTop: 10 },
  scoreCircle: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  scoreCircleTrack: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 5, borderColor: 'rgba(255,255,255,0.25)' },
  scoreCircleInner: { alignItems: 'center' },
  scoreValue: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  scoreMax: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: '600' },
  repairBanner: { marginBottom: 10, backgroundColor: Colors.warnLight, borderColor: '#f4c99a' },
  importBanner: { marginBottom: 20, backgroundColor: Colors.orangeLight },
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
  activityIcon: { width: 36, height: 36, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  activityText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  activityTime: { color: Colors.textSub, fontSize: 11 },
  activityDot: { width: 7, height: 7, borderRadius: 4 },
  settingsRow: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  settingsText: { color: Colors.textSub, fontSize: 13, fontWeight: '600' },
});