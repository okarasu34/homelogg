import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Colors } from '../src/constants/theme';
import { useLang } from '../src/lib/LangContext';

export default function ScanScreen() {
  const { t } = useLang();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Auto-navigate to result after 2.5 seconds (demo)
    const timer = setTimeout(() => {
      router.replace('/scan-result');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Kamera tilgang er nødvendig for å skanne dokumenter.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Gi tilgang</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Avbryt</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webCamBg]} />
      )}

      {/* Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* Dimmed areas */}
        <View style={styles.dimTop} />
        <View style={styles.dimRow}>
          <View style={styles.dimSide} />
          {/* Scan frame */}
          <View style={styles.frame}>
            {/* Corners */}
            {[
              { top: -2, left: -2 },
              { top: -2, right: -2 },
              { bottom: -2, left: -2 },
              { bottom: -2, right: -2 },
            ].map((pos, i) => (
              <View key={i} style={[styles.corner, pos]} />
            ))}
            {/* Scanline */}
            {scanning && (
              <View style={styles.scanline} />
            )}
            {/* Mock document content */}
            <View style={styles.docContent}>
              {[60, 40, 80, 55, 70, 35].map((w, i) => (
                <View key={i} style={[styles.docLine, { width: `${w}%` as any }]} />
              ))}
              <View style={styles.docDivider} />
              <View style={[styles.docLine, { width: '45%' as any, alignSelf: 'flex-end', backgroundColor: 'rgba(74,222,128,0.6)' }]} />
            </View>
          </View>
          <View style={styles.dimSide} />
        </View>
        <View style={styles.dimBottom} />
      </View>

      {/* Status */}
      <View style={styles.statusWrap}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{t.scanning}</Text>
        </View>
      </View>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  webCamBg: { backgroundColor: '#1a2a1a' },

  dimTop: { height: '18%', backgroundColor: 'rgba(0,0,0,0.5)' },
  dimRow: { flexDirection: 'row', height: '60%' },
  dimSide: { width: '10%', backgroundColor: 'rgba(0,0,0,0.5)' },
  dimBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },

  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(74,222,128,0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 20, height: 20,
    borderColor: '#4ade80',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  scanline: {
    position: 'absolute',
    left: 0, right: 0, height: 2,
    top: '40%',
    backgroundColor: '#4ade80',
    opacity: 0.9,
  },

  docContent: { padding: 16, gap: 6, flex: 1, justifyContent: 'center' },
  docLine: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  docDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  statusWrap: {
    position: 'absolute',
    bottom: '12%',
    left: 0, right: 0,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  statusText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  backBtn: {
    position: 'absolute',
    top: 60, left: 16,
    width: 36, height: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 18 },

  permBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
