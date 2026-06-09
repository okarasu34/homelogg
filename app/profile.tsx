import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { BackButton } from '../src/components/UI';
import { supabase } from '../src/lib/supabase';
import { useLang } from '../src/lib/LangContext';

const BOLIG_TYPES = ['Leilighet', 'Enebolig', 'Rekkehus', 'Tomannsbolig'];
const OPPVARMING_TYPES = ['Elektrisk', 'Varmepumpe', 'Fjernvarme', 'Gulvvarme', 'Vedovn'];

export default function ProfileScreen() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Account
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Property
  const [address, setAddress] = useState('');
  const [postanummer, setPostanummer] = useState('');
  const [boligType, setBoligType] = useState('');
  const [size, setSize] = useState('');
  const [byggear, setByggear] = useState('');
  const [etasje, setEtasje] = useState('');
  const [oppvarming, setOppvarming] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const fullName = user.user_metadata?.full_name || '';
        const parts = fullName.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
        setEmail(user.email || '');
        // Property data
        const meta = user.user_metadata || {};
        setAddress(meta.address || '');
        setPostanummer(meta.postanummer || '');
        setBoligType(meta.bolig_type || '');
        setSize(meta.size_m2 || '');
        setByggear(meta.byggear || '');
        setEtasje(meta.etasje || '');
        setOppvarming(meta.oppvarming || '');
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const updates: any = {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          address, postanummer,
          bolig_type: boligType,
          size_m2: size,
          byggear, etasje, oppvarming,
        },
      };
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>👤 Profil</Text>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>KONTOINFORMASJON</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.inputLabel}>Fornavn</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Bjørn" placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.half}>
              <Text style={styles.inputLabel}>Etternavn</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Hansen" placeholderTextColor={Colors.textMuted} />
            </View>
          </View>

          <Text style={styles.inputLabel}>E-post</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="bjorn@example.no" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.inputLabel}>Nytt passord (la stå tom for å beholde)</Text>
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" placeholderTextColor={Colors.textMuted} secureTextEntry />
        </View>

        {/* Property Section */}
        <Text style={styles.sectionLabel}>BOLIGINFORMASJON</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Ekebergveien 12" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.inputLabel}>Postnummer</Text>
          <TextInput style={styles.input} value={postanummer} onChangeText={setPostanummer} placeholder="0001" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={4} />

          <Text style={styles.inputLabel}>Boligtype</Text>
          <View style={styles.chips}>
            {BOLIG_TYPES.map(type => (
              <TouchableOpacity key={type} onPress={() => setBoligType(type)}
                style={[styles.chip, boligType === type && styles.chipActive]}>
                <Text style={[styles.chipText, boligType === type && styles.chipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.inputLabel}>Størrelse (m²)</Text>
              <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="75" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
            </View>
            <View style={styles.half}>
              <Text style={styles.inputLabel}>Byggeår</Text>
              <TextInput style={styles.input} value={byggear} onChangeText={setByggear} placeholder="1998" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={4} />
            </View>
          </View>

          <Text style={styles.inputLabel}>Etasje</Text>
          <TextInput style={styles.input} value={etasje} onChangeText={setEtasje} placeholder="2" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />

          <Text style={styles.inputLabel}>Oppvarming</Text>
          <View style={styles.chips}>
            {OPPVARMING_TYPES.map(type => (
              <TouchableOpacity key={type} onPress={() => setOppvarming(type)}
                style={[styles.chip, oppvarming === type && styles.chipActive]}>
                <Text style={[styles.chipText, oppvarming === type && styles.chipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {saved ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Lagret!</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lagre endringer</Text>}
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
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: 16, marginBottom: 20, ...Shadow.sm },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  errorBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.md, padding: 12, marginBottom: 12 },
  errorText: { color: Colors.danger, fontSize: 12, fontWeight: '600' },
  successBox: { backgroundColor: Colors.accentLight, borderRadius: Radius.md, padding: 12, marginBottom: 12 },
  successText: { color: Colors.accent, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
