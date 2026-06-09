import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, BackButton } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';
import { supabase } from '../../src/lib/supabase';

interface Device {
  id: string;
  name: string;
  brand: string;
  installed_year: string;
  warranty_until: string;
  status: string;
  icon: string;
}

const DEVICE_ICONS = ['🔥', '❄️', '🫧', '👕', '🍳', '💡', '🚿', '🔌', '📡', '🛁'];

export default function DevicesScreen() {
  const { t } = useLang();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [installedYear, setInstalledYear] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔧');

  useEffect(() => { fetchDevices(); }, []);

  const fetchDevices = async () => {
    setLoading(true);
    const { data } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
    if (data) setDevices(data);
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

    const currentYear = new Date().getFullYear();
    const warrantyYear = warrantyUntil ? parseInt(warrantyUntil) : null;
    const status = warrantyYear && warrantyYear < currentYear ? 'warn' : 'good';

    await supabase.from('devices').insert({
      property_id: propertyId,
      name, brand,
      installed_year: installedYear,
      warranty_until: warrantyUntil,
      status,
      icon: selectedIcon,
    });

    setSaving(false);
    setModalVisible(false);
    setName(''); setBrand(''); setInstalledYear(''); setWarrantyUntil(''); setSelectedIcon('🔧');
    fetchDevices();
  };

  const expiredCount = devices.filter(d => {
    if (!d.warranty_until) return false;
    return parseInt(d.warranty_until) < new Date().getFullYear();
  }).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title}>{t.devices}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>{t.add}</Text>
          </TouchableOpacity>
        </View>

        {expiredCount > 0 && (
          <View style={styles.warningBanner}>
            <Text style={{ fontSize: 20 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>{t.warrantyWarning}</Text>
              <Text style={styles.warningSub}>{expiredCount} enhet(er) med utløpt garanti</Text>
            </View>
            <TouchableOpacity style={styles.findBtn} onPress={() => router.push('/repair')}>
              <Text style={styles.findBtnText}>Finn →</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
        ) : devices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>Ingen enheter ennå</Text>
            <Text style={styles.emptySub}>Legg til dine husholdningsapparater</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>+ Legg til enhet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          devices.map((device) => {
            const expired = device.warranty_until && parseInt(device.warranty_until) < new Date().getFullYear();
            return (
              <Card key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceRow}>
                  <View style={[styles.deviceIcon, { backgroundColor: expired ? Colors.warnLight : Colors.accentLight }]}>
                    <Text style={{ fontSize: 22 }}>{device.icon || '🔧'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.deviceTopRow}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Tag
                        label={expired ? t.checkNeeded : '✓ OK'}
                        color={expired ? Colors.warn : Colors.accent}
                        bg={expired ? Colors.warnLight : Colors.accentLight}
                      />
                    </View>
                    {device.brand ? <Text style={styles.deviceBrand}>{device.brand}</Text> : null}
                    {device.installed_year ? <Text style={styles.deviceInfo}>{t.installed}: {device.installed_year}</Text> : null}
                    {device.warranty_until ? <Text style={[styles.deviceInfo, expired && { color: Colors.warn }]}>{t.warrantyUntil} {device.warranty_until}</Text> : null}
                  </View>
                </View>
                {expired && (
                  <TouchableOpacity style={styles.faultBanner} onPress={() => router.push('/repair')}>
                    <Text style={styles.faultBannerText}>🔨 {t.faultDetected}</Text>
                    <Text style={{ color: Colors.warn, fontSize: 14 }}>›</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ny enhet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Enhetsnavn *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="f.eks. Kjele" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.inputLabel}>Merke</Text>
            <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="f.eks. Vaillant" placeholderTextColor={Colors.textMuted} />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Installert år</Text>
                <TextInput style={styles.input} value={installedYear} onChangeText={setInstalledYear} placeholder="2021" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={4} />
              </View>
              <View style={styles.half}>
                <Text style={styles.inputLabel}>Garanti til (år)</Text>
                <TextInput style={styles.input} value={warrantyUntil} onChangeText={setWarrantyUntil} placeholder="2026" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={4} />
              </View>
            </View>

            <Text style={styles.inputLabel}>Ikon</Text>
            <View style={styles.iconGrid}>
              {DEVICE_ICONS.map(icon => (
                <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)}
                  style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnActive]}>
                  <Text style={{ fontSize: 22 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.warnLight, borderWidth: 1, borderColor: '#f4c99a', borderRadius: 14, padding: 12, marginBottom: 18 },
  warningTitle: { color: Colors.warn, fontSize: 12, fontWeight: '800' },
  warningSub: { color: Colors.textSub, fontSize: 11 },
  findBtn: { backgroundColor: Colors.warn, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  findBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: Colors.textSub, fontSize: 13, marginBottom: 20 },
  emptyBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  deviceCard: { padding: 16, marginBottom: 10 },
  deviceRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  deviceIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deviceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  deviceName: { color: Colors.text, fontSize: 14, fontWeight: '700', flex: 1 },
  deviceBrand: { color: Colors.textSub, fontSize: 12 },
  deviceInfo: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  faultBanner: { marginTop: 10, backgroundColor: Colors.warnLight, borderWidth: 1, borderColor: '#f4c99a', borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faultBannerText: { color: Colors.warn, fontSize: 12, fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: Colors.bg },
  modalContent: { padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  modalClose: { color: Colors.textSub, fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSub, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.text },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  iconBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 24, ...Shadow.md },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});