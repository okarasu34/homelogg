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

interface MaintenanceRecord {
  id: string;
  title: string;
  date: string;
  cost: number;
  category: string;
  notes: string;
  source: string;
  created_at: string;
}

export default function MaintenanceScreen() {
  const { t } = useLang();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [notes, setNotes] = useState('');

  const categories = ['maintenance', 'renovation', 'utility', 'insurance', 'other'];
  const categoryLabels: Record<string, string> = {
    maintenance: 'Vedlikehold',
    renovation: 'Renovering',
    utility: 'Strøm',
    insurance: 'Forsikring',
    other: 'Annet',
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('date', { ascending: false });

    if (data) setRecords(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title || !date) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get property id
    const { data: property } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!property) {
      // Create default property
      const { data: newProp } = await supabase
        .from('properties')
        .insert({ user_id: user.id, address: 'Min bolig', city: 'Oslo' })
        .select()
        .single();

      if (newProp) {
        await saveRecord(newProp.id);
      }
    } else {
      await saveRecord(property.id);
    }

    setSaving(false);
    setModalVisible(false);
    resetForm();
    fetchRecords();
  };

  const saveRecord = async (propertyId: string) => {
    await supabase.from('maintenance_records').insert({
      property_id: propertyId,
      title,
      date,
      cost: cost ? parseFloat(cost) : null,
      category,
      notes,
      source: 'manual',
    });
  };

  const resetForm = () => {
    setTitle(''); setDate(''); setCost(''); setNotes(''); setCategory('maintenance');
  };

  const total = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.maintenanceHistory}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Legg til</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.orange }]}>{records.length}</Text>
            <Text style={styles.statLabel}>{t.records}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>kr {total.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t.total}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.gold }]}>95</Text>
            <Text style={styles.statLabel}>{t.score}</Text>
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
        ) : records.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>Ingen oppføringer ennå</Text>
            <Text style={styles.emptySub}>Legg til ditt første vedlikeholdsarbeid</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>+ Legg til</Text>
            </TouchableOpacity>
          </View>
        ) : (
          records.map((item) => (
            <Card key={item.id} style={styles.record}>
              <View style={styles.recordRow}>
                <View style={styles.recordIcon}>
                  <Text style={{ fontSize: 22 }}>🔧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.recordTopRow}>
                    <Text style={styles.recordTitle}>{item.title}</Text>
                    {item.cost ? <Text style={styles.recordCost}>kr {item.cost.toLocaleString()}</Text> : null}
                  </View>
                  <View style={styles.recordBottomRow}>
                    <Text style={styles.recordDate}>{item.date}</Text>
                    <Tag label={categoryLabels[item.category] || item.category} color={Colors.accent} bg={Colors.accentLight} />
                  </View>
                  {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nytt vedlikehold</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tittel *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="f.eks. Takreparasjon" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Dato *</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2024-03-14" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Kostnad (kr)</Text>
            <TextInput style={styles.input} value={cost} onChangeText={setCost} placeholder="5000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Kategori</Text>
            <View style={styles.chips}>
              {categories.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.chip, category === cat && styles.chipActive]}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{categoryLabels[cat]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notater</Text>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Valgfri beskrivelse..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />

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
  addBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8, ...Shadow.sm },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statsCard: { padding: 16, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textSub, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: Colors.textSub, fontSize: 13, marginBottom: 20 },
  emptyBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  record: { padding: 16, marginBottom: 10 },
  recordRow: { flexDirection: 'row', gap: 14 },
  recordIcon: { width: 48, height: 48, backgroundColor: Colors.accentLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recordTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recordTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', flex: 1 },
  recordCost: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  recordBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { color: Colors.textSub, fontSize: 12 },
  recordNotes: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  modalClose: { color: Colors.textSub, fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  textArea: { height: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});