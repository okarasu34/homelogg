import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';
import { supabase } from '../src/lib/supabase';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLang();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.settings}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t.language.toUpperCase()}</Text>
        <Card style={styles.card}>
          {[
            { code: 'no' as const, label: `🇳🇴 ${t.norwegian}` },
            { code: 'en' as const, label: `🇬🇧 ${t.english}` },
          ].map((l, i) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langRow, i === 0 && styles.langRowBorder]}
              onPress={() => setLang(l.code)}
            >
              <Text style={styles.langLabel}>{l.label}</Text>
              {lang === l.code && <Text style={{ color: Colors.accent, fontSize: 18 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>{t.notifications.toUpperCase()}</Text>
        <Card style={styles.card}>
          {[
            { label: 'Garantiadvarsler', val: true },
            { label: 'Energirapporter', val: true },
            { label: 'Vedlikeholdspåminnelser', val: false },
          ].map((n, i) => (
            <View key={i} style={[styles.notifRow, i < 2 && styles.rowBorder]}>
              <Text style={styles.notifLabel}>{n.label}</Text>
              <Switch
                value={n.val}
                trackColor={{ false: Colors.border, true: Colors.accentSoft }}
                thumbColor={n.val ? Colors.accent : Colors.textMuted}
              />
            </View>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>{t.about.toUpperCase()}</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Husbok</Text>
            <Text style={styles.settingSub}>{t.version}</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t.signOut}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  sectionLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8, marginTop: 4 },
  card: { marginBottom: 20 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  langRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  langLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  settingRow: { padding: 16 },
  settingLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  settingSub: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifLabel: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  signOutBtn: { backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f5c5c0' },
  signOutText: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
});