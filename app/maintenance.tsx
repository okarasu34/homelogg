import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Modal, ActivityIndicator, Image, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
  photo_url: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  maintenance: 'Vedlikehold',
  renovation: 'Renovering',
  utility: 'Strøm',
  insurance: 'Forsikring',
  other: 'Annet',
};

const categoryIcons: Record<string, string> = {
  maintenance: '🔧',
  renovation: '🏚️',
  utility: '⚡',
  insurance: '🛡️',
  other: '📄',
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Cross-platform image preview
function PreviewImage({ uri, height }: { uri: string; height: number }) {
  if (Platform.OS === 'web') {
    return <img src={uri} style={{ width: '100%', height, borderRadius: 10, objectFit: 'contain', backgroundColor: '#f5f4f0' }} />;
  }
  return <Image source={{ uri }} style={{ width: '100%', height, borderRadius: 10 }} resizeMode="contain" />;
}

export default function MaintenanceScreen() {
  const { t } = useLang();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<MaintenanceRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [notes, setNotes] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('date', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const pickFile = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setFileBase64(result.split(',')[1]);
          setFileName(file.name);
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true, quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0]) {
      setFileBase64(result.assets[0].base64 || '');
      setFileName(result.assets[0].fileName || 'kvittering.jpg');
    }
  };

  const getOrCreateProperty = async (userId: string) => {
    const { data: property } = await supabase.from('properties').select('id').eq('user_id', userId).single();
    if (property) return property.id;
    const { data: newProp } = await supabase.from('properties')
      .insert({ user_id: userId, address: 'Min bolig', city: 'Oslo' })
      .select().single();
    return newProp?.id;
  };

  const handleSave = async () => {
    if (!title || !date) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const propertyId = await getOrCreateProperty(user.id);
    if (!propertyId) { setSaving(false); return; }

    let photoUrl = '';
    if (fileBase64) {
      const filePath = `${user.id}/${Date.now()}_${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(fileBase64), { contentType: 'image/jpeg' });
      if (uploadError) console.error('Upload error:', uploadError);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
    }

    await supabase.from('maintenance_records').insert({
      property_id: propertyId,
      title, date,
      cost: cost ? parseFloat(cost) : null,
      category, notes,
      photo_url: photoUrl,
      source: 'manual',
    });

    setSaving(false);
    setModalVisible(false);
    setTitle(''); setDate(''); setCost(''); setNotes('');
    setCategory('maintenance'); setFileBase64(''); setFileName('');
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('maintenance_records').delete().eq('id', id);
    setPreviewRecord(null);
    fetchRecords();
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
            <Card key={item.id} style={styles.record} onPress={() => setPreviewRecord(item)}>
              <View style={styles.recordRow}>
                <View style={styles.recordIcon}>
                  <Text style={{ fontSize: 22 }}>{categoryIcons[item.category] || '🔧'}</Text>
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
              {item.photo_url ? (
                <View style={{ marginTop: 10 }}>
                  <PreviewImage uri={item.photo_url} height={100} />
                </View>
              ) : null}
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
              <TouchableOpacity onPress={() => { setModalVisible(false); }}>
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
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TouchableOpacity key={key} onPress={() => setCategory(key)} style={[styles.chip, category === key && styles.chipActive]}>
                  <Text style={[styles.chipText, category === key && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notater</Text>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Valgfri beskrivelse..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />

            <Text style={styles.inputLabel}>Kvittering / Bilde (valgfritt)</Text>
            <TouchableOpacity style={styles.fileBtn} onPress={pickFile}>
              <Text style={styles.fileBtnText}>{fileName || '📎 Velg bilde'}</Text>
            </TouchableOpacity>
            {fileBase64 ? (
              <View style={{ marginTop: 10 }}>
                <PreviewImage uri={`data:image/jpeg;base64,${fileBase64}`} height={160} />
              </View>
            ) : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lagre</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={!!previewRecord} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{previewRecord?.title}</Text>
              <TouchableOpacity onPress={() => setPreviewRecord(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: 'Dato', value: previewRecord?.date },
              { label: 'Kostnad', value: previewRecord?.cost ? `kr ${previewRecord.cost.toLocaleString()}` : '-' },
              { label: 'Kategori', value: categoryLabels[previewRecord?.category || ''] || previewRecord?.category },
              { label: 'Kilde', value: previewRecord?.source === 'scan' ? '📸 Skannet' : previewRecord?.source === 'email' ? '📧 E-post' : '✋ Manuell' },
            ].map((row, i) => (
              <View key={i} style={styles.previewInfo}>
                <Text style={styles.previewInfoLabel}>{row.label}</Text>
                <Text style={styles.previewInfoValue}>{row.value}</Text>
              </View>
            ))}

            {previewRecord?.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notater</Text>
                <Text style={styles.notesText}>{previewRecord.notes}</Text>
              </View>
            ) : null}

            {previewRecord?.photo_url ? (
              <View style={{ marginTop: 16 }}>
                <PreviewImage uri={previewRecord.photo_url} height={300} />
              </View>
            ) : (
              <View style={styles.noPreview}>
                <Text style={{ fontSize: 40 }}>🔧</Text>
                <Text style={styles.noPreviewText}>Ingen kvittering lastet opp</Text>
              </View>
            )}

            <TouchableOpacity style={styles.deleteBtn} onPress={() => previewRecord && handleDelete(previewRecord.id)}>
              <Text style={styles.deleteBtnText}>🗑️ Slett oppføring</Text>
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
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  modalClose: { color: Colors.textSub, fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  textArea: { height: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  fileBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  fileBtnText: { color: Colors.textSub, fontSize: 13 },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  previewInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  previewInfoLabel: { color: Colors.textSub, fontSize: 13 },
  previewInfoValue: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  notesBox: { backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 12, marginTop: 12 },
  notesLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  notesText: { color: Colors.text, fontSize: 13 },
  noPreview: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  noPreviewText: { color: Colors.textMuted, fontSize: 13 },
  deleteBtn: { backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: '#f5c5c0' },
  deleteBtnText: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
});