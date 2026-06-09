import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, Tag, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';
import { supabase } from '../src/lib/supabase';

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  created_at: string;
}

const DOC_TYPES = ['Skjøte', 'Forsikring', 'Energisertifikat', 'Brukstillatelse', 'Byggetillatelse', 'Annet'];
const DOC_ICONS: Record<string, string> = {
  'Skjøte': '📋', 'Forsikring': '🛡️', 'Energisertifikat': '⚡',
  'Brukstillatelse': '🏛️', 'Byggetillatelse': '🏗️', 'Annet': '📄',
};
const DOC_COLORS: Record<string, string> = {
  'Skjøte': Colors.purple, 'Forsikring': Colors.accent, 'Energisertifikat': Colors.gold,
  'Brukstillatelse': Colors.blue, 'Byggetillatelse': Colors.orange, 'Annet': Colors.textSub,
};

export default function DocumentsScreen() {
  const { t } = useLang();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Skjøte');
  const [date, setDate] = useState('');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setDocuments(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let propertyId = '';
    const { data: property } = await supabase.from('properties').select('id').eq('user_id', user.id).single();
    if (property) {
      propertyId = property.id;
    } else {
      const { data: newProp } = await supabase.from('properties').insert({ user_id: user.id, address: 'Min bolig', city: 'Oslo' }).select().single();
      if (newProp) propertyId = newProp.id;
    }

    await supabase.from('documents').insert({ property_id: propertyId, name, type, date: date || new Date().toISOString().split('T')[0] });
    setSaving(false);
    setModalVisible(false);
    setName(''); setType('Skjøte'); setDate('');
    fetchDocuments();
  };

  const completion = Math.round((documents.length / 7) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.documents}</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.uploadBtnText}>+ Legg til</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{t.completion}</Text>
            <Text style={styles.progressPct}>{Math.min(completion, 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(completion, 100)}%` }]} />
          </View>
          <Text style={styles.progressSub}>{documents.length} av 7 dokumenter lastet opp</Text>
        </Card>

        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
        ) : documents.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Ingen dokumenter ennå</Text>
            <Text style={styles.emptySub}>Legg til dine viktige boligdokumenter</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>+ Legg til dokument</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {documents.map((doc) => (
              <Card key={doc.id} style={styles.docCard} onPress={() => {}}>
                <View style={[styles.docIcon, { backgroundColor: `${DOC_COLORS[doc.type] || Colors.textSub}18` }]}>
                  <Text style={{ fontSize: 20 }}>{DOC_ICONS[doc.type] || '📄'}</Text>
                </View>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docType}>{doc.type}</Text>
                <Text style={styles.docDate}>{doc.date}</Text>
                <Tag label={t.available} color={Colors.accent} bg={Colors.accentLight} style={{ marginTop: 7 }} />
              </Card>
            ))}
            <TouchableOpacity style={styles.addCard} onPress={() => setModalVisible(true)}>
              <View style={styles.addIcon}><Text style={{ fontSize: 20 }}>➕</Text></View>
              <Text style={styles.addText}>Legg til dokument</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nytt dokument</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Dokumentnavn *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="f.eks. Skjøte 2018" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.chips}>
              {DOC_TYPES.map(dt => (
                <TouchableOpacity key={dt} onPress={() => setType(dt)} style={[styles.chip, type === dt && styles.chipActive]}>
                  <Text style={[styles.chipText, type === dt && styles.chipTextActive]}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Dato</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2024-01-01" placeholderTextColor={Colors.textMuted} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lagre</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  uploadBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8, ...Shadow.sm },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  progressCard: { padding: 14, marginBottom: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  progressPct: { color: Colors.gold, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  progressSub: { color: Colors.textMuted, fontSize: 11 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: Colors.textSub, fontSize: 13, marginBottom: 20 },
  emptyBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  docCard: { width: '47%', padding: 16 },
  docIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  docName: { color: Colors.text, fontSize: 12, fontWeight: '700', lineHeight: 16, marginBottom: 2 },
  docType: { color: Colors.textSub, fontSize: 10, marginBottom: 2 },
  docDate: { color: Colors.textMuted, fontSize: 10 },
  addCard: { width: '47%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: Radius.xl, padding: 16, alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
  addIcon: { width: 40, height: 40, backgroundColor: Colors.border, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  addText: { color: Colors.textSub, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  modalClose: { color: Colors.textSub, fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});