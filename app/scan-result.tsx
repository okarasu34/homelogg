import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';
import { supabase } from '../src/lib/supabase';
import { ScanResult } from '../src/lib/openai';

const categoryLabels: Record<string, string> = {
  maintenance: 'Vedlikehold',
  renovation: 'Renovering',
  utility: 'Strøm',
  insurance: 'Forsikring',
  other: 'Annet',
};

const DOC_TYPES = ['Skjøte', 'Forsikring', 'Energisertifikat', 'Brukstillatelse', 'Byggetillatelse', 'Annet'];
const DEVICE_ICONS = ['🔥', '❄️', '🫧', '👕', '🍳', '💡', '🚿', '🔌', '📡', '🛁'];

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function getOrCreateProperty(userId: string) {
  const { data: property } = await supabase.from('properties').select('id').eq('user_id', userId).single();
  if (property) return property.id;
  const { data: newProp } = await supabase.from('properties')
    .insert({ user_id: userId, address: 'Min bolig', city: 'Oslo' })
    .select().single();
  return newProp?.id;
}

export default function ScanResultScreen() {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [imageBase64, setImageBase64] = useState('');

  // Invoice fields
  const [invCategory, setInvCategory] = useState('maintenance');
  const [invTitle, setInvTitle] = useState('');
  const [invDate, setInvDate] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invCompany, setInvCompany] = useState('');

  // Device fields
  const [devName, setDevName] = useState('');
  const [devBrand, setDevBrand] = useState('');
  const [devInstalled, setDevInstalled] = useState('');
  const [devWarranty, setDevWarranty] = useState('');
  const [devIcon, setDevIcon] = useState('🔧');

  // Document fields
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Annet');
  const [docDate, setDocDate] = useState('');

  useEffect(() => {
    const result = (global as any).__scanResult as ScanResult | undefined;
    const img = (global as any).__scanImageBase64 as string | undefined;
    if (img) setImageBase64(img);

    if (result) {
      setScanResult(result);
      if (result.docType === 'invoice') {
        setInvCategory(result.category || 'maintenance');
        setInvTitle(result.type || 'Faktura');
        setInvDate(formatDate(result.date) || todayStr());
        setInvAmount((result.amount || '').replace(/[^\d.,]/g, '').replace(',', '.'));
        setInvCompany(result.company || '');
      } else if (result.docType === 'device') {
        setDevName(result.deviceName || 'Ny enhet');
        setDevBrand(result.brand || '');
        setDevInstalled(result.installedYear || new Date().getFullYear().toString());
        const warrantyYear = new Date().getFullYear() + (result.warrantyYears || 2);
        setDevWarranty(warrantyYear.toString());
      } else if (result.docType === 'document') {
        setDocName(result.docName || 'Dokument');
        setDocType(result.docCategory || 'Annet');
        setDocDate(formatDate(result.date) || todayStr());
      }
    } else {
      setScanResult({ docType: 'invoice', type: 'Faktura', category: 'maintenance', confidence: 50 });
      setInvTitle('Faktura');
      setInvDate(todayStr());
      setInvCategory('maintenance');
    }
  }, []);

  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(d?: string) {
    if (!d) return '';
    const m = d.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
    if (m) {
      let [, day, month, year] = m;
      if (year.length === 2) year = '20' + year;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }

  const uploadImage = async (userId: string): Promise<string> => {
    if (!imageBase64) return '';
    try {
      const filePath = `${userId}/${Date.now()}_scan.jpg`;
      const { data: uploadData, error } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(imageBase64), { contentType: 'image/jpeg' });
      if (error) {
        console.error('Upload error:', error);
        return '';
      }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (e) {
      console.error('Upload exception:', e);
      return '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const propertyId = await getOrCreateProperty(user.id);
    if (!propertyId) { setSaving(false); return; }

    const photoUrl = await uploadImage(user.id);

    if (scanResult?.docType === 'invoice') {
      const cost = invAmount ? parseFloat(invAmount) : null;
      await supabase.from('maintenance_records').insert({
        property_id: propertyId,
        title: invTitle,
        date: invDate,
        cost,
        category: invCategory,
        notes: invCompany ? `Firma: ${invCompany}` : '',
        source: 'scan',
        photo_url: photoUrl,
      });
    } else if (scanResult?.docType === 'device') {
      const currentYear = new Date().getFullYear();
      const status = devWarranty && parseInt(devWarranty) < currentYear ? 'warn' : 'good';
      await supabase.from('devices').insert({
        property_id: propertyId,
        name: devName,
        brand: devBrand,
        installed_year: devInstalled,
        warranty_until: devWarranty,
        status,
        icon: devIcon,
      });
    } else if (scanResult?.docType === 'document') {
      await supabase.from('documents').insert({
        property_id: propertyId,
        name: docName,
        type: docType,
        date: docDate,
        file_url: photoUrl,
      });
    }

    setSaving(false);
    setSaved(true);
    delete (global as any).__scanResult;
    delete (global as any).__scanImageBase64;
  };

  if (!scanResult) return <View style={styles.safe}><ActivityIndicator color={Colors.accent} /></View>;

  if (saved) {
    const destination = scanResult.docType === 'invoice'
      ? (scanResult.category === 'utility' ? '/(tabs)/energy' : '/maintenance')
      : scanResult.docType === 'device' ? '/(tabs)/devices' : '/documents';

    const destLabel = scanResult.docType === 'invoice'
      ? (scanResult.category === 'utility' ? 'Energi' : 'Vedlikehold')
      : scanResult.docType === 'device' ? 'Enheter' : 'Dokumenter';

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.savedWrap}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.savedTitle}>{t.savedSuccess}</Text>
          <Text style={styles.savedSub}>Lagt til i {destLabel}</Text>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace(destination as any)}>
            <Text style={styles.homeBtnText}>Gå til {destLabel} →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtnSecondary} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeBtnSecondaryText}>{t.backHome}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.scanSuccess}</Text>
        </View>

        {/* Image preview */}
        {imageBase64 ? (
          <Image source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} style={styles.imagePreview} resizeMode="cover" />
        ) : null}

        {/* AI Detection banner */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiIcon}>
              <Text style={{ fontSize: 22 }}>
                {scanResult.docType === 'invoice' ? '📄' : scanResult.docType === 'device' ? '🔧' : '📋'}
              </Text>
            </View>
            <View>
              <Text style={styles.aiLabel}>AI OPPDAGET</Text>
              <Text style={styles.aiType}>
                {scanResult.docType === 'invoice' ? 'Faktura / Kvittering' :
                 scanResult.docType === 'device' ? 'Husholdningsapparat' : 'Boligdokument'}
              </Text>
            </View>
          </View>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{t.aiConfidence}</Text>
            <Text style={styles.confidenceVal}>{scanResult.confidence}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${scanResult.confidence}%` as any }]} />
          </View>
        </View>

        {/* INVOICE FORM */}
        {scanResult.docType === 'invoice' && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>✏️ Kontroller og lagre i Vedlikehold</Text>

            <Text style={styles.inputLabel}>Tittel</Text>
            <TextInput style={styles.input} value={invTitle} onChangeText={setInvTitle} placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Firma</Text>
            <TextInput style={styles.input} value={invCompany} onChangeText={setInvCompany} placeholder="Firmanavn" placeholderTextColor={Colors.textMuted} />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Dato</Text>
                <TextInput style={styles.input} value={invDate} onChangeText={setInvDate} placeholder="2024-03-14" placeholderTextColor={Colors.textMuted} />
              </View>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Beløp (kr)</Text>
                <TextInput style={styles.input} value={invAmount} onChangeText={setInvAmount} placeholder="4890" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.inputLabel}>Kategori</Text>
            <View style={styles.chips}>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TouchableOpacity key={key} onPress={() => setInvCategory(key)} style={[styles.chip, invCategory === key && styles.chipActive]}>
                  <Text style={[styles.chipText, invCategory === key && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.destHint}>
              → {invCategory === 'utility' ? 'Lagres i Energi' : 'Lagres i Vedlikehold'}
            </Text>
          </View>
        )}

        {/* DEVICE FORM */}
        {scanResult.docType === 'device' && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>✏️ Kontroller og lagre i Enheter</Text>

            <Text style={styles.inputLabel}>Enhetsnavn</Text>
            <TextInput style={styles.input} value={devName} onChangeText={setDevName} placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Merke</Text>
            <TextInput style={styles.input} value={devBrand} onChangeText={setDevBrand} placeholder="f.eks. Bosch" placeholderTextColor={Colors.textMuted} />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Installert år</Text>
                <TextInput style={styles.input} value={devInstalled} onChangeText={setDevInstalled} keyboardType="numeric" maxLength={4} placeholderTextColor={Colors.textMuted} />
              </View>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Garanti til</Text>
                <TextInput style={styles.input} value={devWarranty} onChangeText={setDevWarranty} keyboardType="numeric" maxLength={4} placeholderTextColor={Colors.textMuted} />
              </View>
            </View>

            <Text style={styles.inputLabel}>Ikon</Text>
            <View style={styles.iconGrid}>
              {DEVICE_ICONS.map(icon => (
                <TouchableOpacity key={icon} onPress={() => setDevIcon(icon)} style={[styles.iconBtn, devIcon === icon && styles.iconBtnActive]}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.destHint}>→ Lagres i Enheter</Text>
          </View>
        )}

        {/* DOCUMENT FORM */}
        {scanResult.docType === 'document' && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>✏️ Kontroller og lagre i Dokumenter</Text>

            <Text style={styles.inputLabel}>Dokumentnavn</Text>
            <TextInput style={styles.input} value={docName} onChangeText={setDocName} placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.chips}>
              {DOC_TYPES.map(dt => (
                <TouchableOpacity key={dt} onPress={() => setDocType(dt)} style={[styles.chip, docType === dt && styles.chipActive]}>
                  <Text style={[styles.chipText, docType === dt && styles.chipTextActive]}>{dt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Dato</Text>
            <TextInput style={styles.input} value={docDate} onChangeText={setDocDate} placeholder="2024-01-01" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.destHint}>→ Lagres i Dokumenter</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.rescanBtn} onPress={() => router.replace('/scan')}>
            <Text style={styles.rescanText}>{t.rescan}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>{t.saveRecord} →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },

  imagePreview: { width: '100%', height: 180, borderRadius: Radius.xl, marginBottom: 14, backgroundColor: Colors.surface },

  aiCard: { backgroundColor: '#e8f5ef', borderWidth: 1, borderColor: '#b8e0cc', borderRadius: Radius.xl, padding: 18, marginBottom: 14 },
  aiCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  aiIcon: { width: 44, height: 44, backgroundColor: Colors.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aiLabel: { color: Colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  aiType: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  confidenceLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '600' },
  confidenceVal: { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 5, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },

  formBox: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: 16, marginBottom: 20 },
  formTitle: { color: Colors.text, fontSize: 13, fontWeight: '800', marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  iconBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  destHint: { color: Colors.accent, fontSize: 11, fontWeight: '700', marginTop: 12 },

  actions: { flexDirection: 'row', gap: 10 },
  rescanBtn: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  rescanText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  savedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  savedTitle: { color: Colors.accent, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  savedSub: { color: Colors.textSub, fontSize: 14, marginBottom: 24 },
  homeBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, ...Shadow.md, marginBottom: 12 },
  homeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  homeBtnSecondary: { paddingVertical: 10 },
  homeBtnSecondaryText: { color: Colors.textSub, fontSize: 13 },
});