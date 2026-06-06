import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, Button, SectionLabel } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';

export default function DevicesScreen() {
  const { t } = useLang();

  const devices = [
    { id: 1, name: t.boiler, brand: 'Vaillant', installed: '2021', warranty: '2026', status: 'good', icon: '🔥', fault: false },
    { id: 2, name: t.ac, brand: 'Daikin', installed: '2022', warranty: '2027', status: 'good', icon: '❄️', fault: false },
    { id: 3, name: t.dishwasher, brand: 'Bosch', installed: '2019', warranty: '2024', status: 'warn', icon: '🫧', fault: true },
    { id: 4, name: t.washer, brand: 'Miele', installed: '2020', warranty: '2025', status: 'good', icon: '👕', fault: false },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.devices}</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>{t.add}</Text>
          </TouchableOpacity>
        </View>

        {/* Warning */}
        <View style={styles.warningBanner}>
          <Text style={{ fontSize: 20 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>{t.warrantyWarning}</Text>
            <Text style={styles.warningSub}>{t.warrantyExpired}</Text>
          </View>
          <TouchableOpacity
            style={styles.findBtn}
            onPress={() => router.push('/repair')}
          >
            <Text style={styles.findBtnText}>Finn →</Text>
          </TouchableOpacity>
        </View>

        {/* Devices */}
        {devices.map((device) => (
          <Card key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <View style={[
                styles.deviceIcon,
                { backgroundColor: device.status === 'warn' ? Colors.warnLight : Colors.accentLight },
              ]}>
                <Text style={{ fontSize: 22 }}>{device.icon}</Text>
                {device.fault && <View style={styles.faultDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.deviceTopRow}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Tag
                    label={device.status === 'good' ? '✓ OK' : t.checkNeeded}
                    color={device.status === 'good' ? Colors.accent : Colors.warn}
                    bg={device.status === 'good' ? Colors.accentLight : Colors.warnLight}
                  />
                </View>
                <Text style={styles.deviceBrand}>
                  {device.brand} · {t.installed}: {device.installed}
                </Text>
                <Text style={styles.deviceWarranty}>
                  {t.warrantyUntil} {device.warranty}
                </Text>
              </View>
            </View>
            {device.fault && (
              <TouchableOpacity
                style={styles.faultBanner}
                onPress={() => router.push('/repair')}
              >
                <Text style={styles.faultBannerText}>🔨 {t.faultDetected}</Text>
                <Text style={{ color: Colors.warn, fontSize: 14 }}>›</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Shadow.sm,
  },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.warnLight,
    borderWidth: 1,
    borderColor: '#f4c99a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  warningTitle: { color: Colors.warn, fontSize: 12, fontWeight: '800' },
  warningSub: { color: Colors.textSub, fontSize: 11 },
  findBtn: { backgroundColor: Colors.warn, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  findBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  deviceCard: { padding: 16, marginBottom: 10 },
  deviceRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  deviceIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  faultDot: {
    position: 'absolute', top: -4, right: -4,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.warn,
    borderWidth: 2, borderColor: Colors.bg,
  },
  deviceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  deviceName: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  deviceBrand: { color: Colors.textSub, fontSize: 12 },
  deviceWarranty: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  faultBanner: {
    marginTop: 10,
    backgroundColor: Colors.warnLight,
    borderWidth: 1,
    borderColor: '#f4c99a',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faultBannerText: { color: Colors.warn, fontSize: 12, fontWeight: '700' },
});
