import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../src/constants/theme';
import { useLang } from '../src/lib/LangContext';
import { scanDocument } from '../src/lib/openai';

export default function ScanScreen() {
  const { t } = useLang();
  const [scanning, setScanning] = useState(false);

  const handleScan = async (fromCamera: boolean) => {
    setScanning(true);
    try {
      let result;
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setScanning(false); return; }
        result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0].base64) {
        const scanResult = await scanDocument(result.assets[0].base64);
        // Store result globally for scan-result screen
        (global as any).__scanResult = scanResult;
        router.replace('/scan-result');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        {/* Scan frame */}
        <View style={styles.frame}>
          {[
            { top: -2, left: -2 },
            { top: -2, right: -2 },
            { bottom: -2, left: -2 },
            { bottom: -2, right: -2 },
          ].map((pos, i) => (
            <View key={i} style={[styles.corner, pos]} />
          ))}
          <Text style={styles.frameHint}>
            {scanning ? '🔍 Skanner...' : 'Plasser dokumentet i rammen'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleScan(true)}
            disabled={scanning}
          >
            <Text style={styles.btnIcon}>📷</Text>
            <Text style={styles.btnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleScan(false)}
            disabled={scanning}
          >
            <Text style={styles.btnIcon}>🖼️</Text>
            <Text style={styles.btnText}>Galleri</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  frame: {
    width: 280, height: 360,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.5)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 20, height: 20,
    borderColor: '#4ade80', borderTopWidth: 3, borderLeftWidth: 3,
  },
  frameHint: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', padding: 20 },
  btnRow: { flexDirection: 'row', gap: 16, marginTop: 40 },
  btn: {
    backgroundColor: Colors.accent, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center', gap: 6,
  },
  btnIcon: { fontSize: 24 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  backBtn: {
    position: 'absolute', top: 60, left: 16,
    width: 36, height: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 18 },
});