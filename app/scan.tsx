import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { useLang } from '../src/lib/LangContext';
import { scanDocument } from '../src/lib/openai';

export default function ScanScreen() {
  const { t } = useLang();
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('');

  const handlePick = async (fromCamera: boolean) => {
    setScanning(true);
    setStatus(fromCamera ? 'Åpner kamera...' : 'Åpner galleri...');
    try {
      let result;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setStatus('Kameratilgang nektet');
          setScanning(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
      }

      if (!result.canceled && result.assets[0].base64) {
        setStatus('AI analyserer dokumentet...');
        const scanResult = await scanDocument(result.assets[0].base64);
        (global as any).__scanResult = scanResult;
        router.replace('/scan-result');
      } else {
        setScanning(false);
        setStatus('');
      }
    } catch (e) {
      console.error(e);
      setScanning(false);
      setStatus('Feil oppstod, prøv igjen');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.headerTitle}>📄 Skann dokument</Text>
        <Text style={styles.headerSub}>Ta bilde av en faktura eller kvittering</Text>

        <View style={styles.frame}>
          {[{ top: -2, left: -2 }, { top: -2, right: -2 }, { bottom: -2, left: -2 }, { bottom: -2, right: -2 }].map((pos, i) => (
            <View key={i} style={[styles.corner, pos]} />
          ))}
          {scanning ? (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <ActivityIndicator color="#4ade80" size="large" />
              <Text style={styles.frameHint}>{status}</Text>
            </View>
          ) : (
            <Text style={styles.frameHint}>AI leser dokumentet automatisk</Text>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={() => handlePick(true)} disabled={scanning}>
            <Text style={styles.btnIcon}>📷</Text>
            <Text style={styles.btnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => handlePick(false)} disabled={scanning}>
            <Text style={styles.btnIcon}>🖼️</Text>
            <Text style={[styles.btnText, { color: Colors.accent }]}>Galleri</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>Støtter fakturaer, kvitteringer og forsikringsdokumenter</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f17' },
  backBtn: { position: 'absolute', top: 60, left: 16, width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  backArrow: { color: '#fff', fontSize: 18 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 32 },
  frame: { width: 280, height: 320, borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.6)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 32 },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#4ade80', borderTopWidth: 3, borderLeftWidth: 3 },
  frameHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  btn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', gap: 6, ...Shadow.md },
  btnSecondary: { backgroundColor: Colors.accentLight },
  btnIcon: { fontSize: 24 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  note: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' },
});