import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { Card, Tag, Button } from '../../src/components/UI';
import { useLang } from '../../src/lib/LangContext';

export default function ImportScreen() {
  const { t } = useLang();
  const [emailConnected, setEmailConnected] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [meterConnected, setMeterConnected] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  const connect = (setter: (v: boolean) => void, loadSetter: (v: boolean) => void) => {
    loadSetter(true);
    setTimeout(() => { loadSetter(false); setter(true); }, 1800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t.importTitle}</Text>
        <Text style={styles.sub}>{t.importMethods}</Text>

        {/* Camera Scan */}
        <View style={[styles.scanCard, Shadow.md]}>
          <View style={styles.scanCardHeader}>
            <View style={styles.scanCardIconWrap}>
              <Text style={{ fontSize: 22 }}>📸</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanCardTitle}>{t.scanPhoto}</Text>
              <Text style={styles.scanCardSub}>{t.scanPhotoSub}</Text>
            </View>
          </View>
          <View style={styles.scanCardBtns}>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => router.push('/scan')}
              activeOpacity={0.85}
            >
              <Text style={styles.scanBtnText}>📷 {t.openCamera}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryBtn}
              onPress={() => router.push('/scan')}
              activeOpacity={0.85}
            >
              <Text style={styles.galleryBtnText}>🖼️ {t.gallery}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connection cards */}
        {[
          {
            icon: '📧',
            label: t.connectEmail,
            sub: t.connectEmailSub,
            btn: t.connectEmailBtn,
            connected: emailConnected,
            loading: emailLoading,
            onConnect: () => connect(setEmailConnected, setEmailLoading),
            color: Colors.blue,
            bg: Colors.blueLight,
            detail: t.emailDetail,
          },
          {
            icon: '🏦',
            label: t.connectBank,
            sub: t.connectBankSub,
            btn: t.connectBankBtn,
            connected: bankConnected,
            loading: bankLoading,
            onConnect: () => connect(setBankConnected, setBankLoading),
            color: Colors.warn,
            bg: Colors.warnLight,
            detail: t.bankDetail,
            badge: '🇳🇴 BankID',
          },
          {
            icon: '⚡',
            label: t.connectMeter,
            sub: t.connectMeterSub,
            btn: t.connectMeterBtn,
            connected: meterConnected,
            loading: false,
            onConnect: () => {},
            color: Colors.accent,
            bg: Colors.accentLight,
            detail: t.meterDetail,
            badge: '🇳🇴 AMS',
          },
        ].map((item, i) => (
          <Card key={i} style={styles.connectCard}>
            <View style={styles.connectRow}>
              <View style={[styles.connectIcon, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.connectLabelRow}>
                  <Text style={styles.connectLabel}>{item.label}</Text>
                  {item.badge && (
                    <Tag label={item.badge} color={item.color} bg={item.bg} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.connectSub}>{item.sub}</Text>
              </View>
              {item.connected ? (
                <Tag label={t.connected} color={Colors.accent} bg={Colors.accentLight} />
              ) : (
                <TouchableOpacity
                  onPress={item.onConnect}
                  style={[styles.connectBtn, { backgroundColor: item.color }]}
                  activeOpacity={0.85}
                >
                  {item.loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.connectBtnText}>{item.btn}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {item.connected && (
              <View style={styles.connectedDetail}>
                <Text style={styles.connectedDetailTitle}>✓ {t.autoSync}</Text>
                <Text style={styles.connectedDetailSub}>{item.detail}</Text>
                {item.icon === '⚡' && (
                  <View style={styles.miniChart}>
                    {[60, 75, 55, 80, 70, 90, 65, 85, 72, 68, 78, 82].map((v, j) => (
                      <View
                        key={j}
                        style={[
                          styles.miniBar,
                          {
                            height: (v / 90) * 28,
                            backgroundColor: j === 11 ? Colors.accent : Colors.accentSoft,
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
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
  title: { color: Colors.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  sub: { color: Colors.textSub, fontSize: 13, marginBottom: 22 },

  scanCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scanCardHeader: {
    backgroundColor: Colors.accent,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  scanCardIconWrap: {
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  scanCardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  scanCardSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  scanCardBtns: { flexDirection: 'row', gap: 8, padding: 14 },
  scanBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    ...Shadow.sm,
  },
  scanBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  galleryBtn: {
    flex: 1,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  galleryBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },

  connectCard: { marginBottom: 12 },
  connectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  connectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  connectLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  connectLabel: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  connectSub: { color: Colors.textSub, fontSize: 11 },
  connectBtn: {
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minWidth: 72,
    alignItems: 'center',
  },
  connectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  connectedDetail: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    padding: 10,
  },
  connectedDetailTitle: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  connectedDetailSub: { color: Colors.textSub, fontSize: 11, marginTop: 2 },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 28,
    marginTop: 8,
  },
  miniBar: { flex: 1, borderRadius: 2 },
});
