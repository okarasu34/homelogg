import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, Tag, BackButton, SectionLabel } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';

export default function RepairScreen() {
  const { t } = useLang();
  const [sortBy, setSortBy] = useState('rating');

  const firms = [
    {
      id: 1,
      name: 'Hansen Hvitevarer AS',
      rating: 4.9,
      reviews: 142,
      distance: '1,2 km',
      price: 'kr 490–890',
      eta: 'I dag',
      badge: t.topRated,
      badgeColor: Colors.gold,
      badgeBg: Colors.goldLight,
      icon: '🔧',
    },
    {
      id: 2,
      name: 'Oslo Reparasjon',
      rating: 4.7,
      reviews: 89,
      distance: '2,1 km',
      price: 'kr 390–750',
      eta: 'I morgen',
      badge: t.fastest,
      badgeColor: Colors.blue,
      badgeBg: Colors.blueLight,
      icon: '⚡',
    },
    {
      id: 3,
      name: 'Tekniker Olsen',
      rating: 4.5,
      reviews: 56,
      distance: '3,4 km',
      price: 'kr 350–690',
      eta: '2 dager',
      badge: t.verified,
      badgeColor: Colors.accent,
      badgeBg: Colors.accentLight,
      icon: '🛠️',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View>
            <Text style={styles.title}>{t.repairTitle}</Text>
            <Text style={styles.sub}>{t.repairSub}</Text>
          </View>
        </View>

        {/* Fault Card */}
        <View style={styles.faultCard}>
          <View style={styles.faultRow}>
            <View style={styles.faultIcon}>
              <Text style={{ fontSize: 24 }}>🫧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.faultBadge}>{t.faultTitle.toUpperCase()}</Text>
              <Text style={styles.faultDevice}>{t.faultDevice}</Text>
              <Text style={styles.faultDesc}>{t.faultDesc}</Text>
            </View>
          </View>
          <View style={styles.faultTags}>
            <Tag label={t.faultSeverity} color={Colors.warn} bg="rgba(196,92,26,0.15)" />
            <Tag label={t.noWarranty} color={Colors.warn} bg="rgba(196,92,26,0.15)" />
          </View>
        </View>

        {/* AI Analysis */}
        <View style={styles.aiBox}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>{t.aiAnalysis}</Text>
            <Text style={styles.aiText}>{t.aiAnalysisText}</Text>
          </View>
        </View>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>{t.sortBy}</Text>
          {[
            { key: 'rating', label: t.sortRating },
            { key: 'price', label: t.sortPrice },
            { key: 'distance', label: t.sortDistance },
          ].map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSortBy(s.key)}
              style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === s.key && styles.sortChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Firms */}
        <SectionLabel label={t.nearbyFirms} />
        {firms.map((firm) => (
          <Card
            key={firm.id}
            style={styles.firmCard}
            onPress={() => router.push({ pathname: '/repair-detail', params: { firmId: firm.id, firmName: firm.name, firmRating: firm.rating, firmReviews: firm.reviews, firmDistance: firm.distance, firmPrice: firm.price, firmEta: firm.eta, firmIcon: firm.icon } })}
          >
            <View style={styles.firmRow}>
              <View style={[styles.firmIcon, { backgroundColor: firm.badgeBg }]}>
                <Text style={{ fontSize: 22 }}>{firm.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.firmTopRow}>
                  <View>
                    <Text style={styles.firmName}>{firm.name}</Text>
                    <View style={styles.firmRatingRow}>
                      <Text style={{ color: Colors.gold, fontSize: 12 }}>★</Text>
                      <Text style={styles.firmRating}>{firm.rating}</Text>
                      <Text style={styles.firmReviews}>({firm.reviews})</Text>
                      <Tag label={t.verified} color={Colors.accent} bg={Colors.accentLight} style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                  <Tag label={firm.badge} color={firm.badgeColor} bg={firm.badgeBg} />
                </View>
                <View style={styles.firmMeta}>
                  {[
                    { icon: '📍', val: firm.distance },
                    { icon: '💰', val: firm.price },
                    { icon: '🕐', val: firm.eta },
                  ].map((m, i) => (
                    <View key={i} style={styles.firmMetaItem}>
                      <Text style={{ fontSize: 12 }}>{m.icon}</Text>
                      <Text style={styles.firmMetaText}>{m.val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.quoteBtn}>
              <Text style={styles.quoteBtnText}>{t.requestQuote} →</Text>
            </View>
          </Card>
        ))}

        <Text style={styles.commissionNote}>{t.commissionNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  sub: { color: Colors.textSub, fontSize: 11 },

  faultCard: {
    backgroundColor: '#fef3e8',
    borderWidth: 1,
    borderColor: '#f4c99a',
    borderRadius: Radius.xl,
    padding: 18,
    marginBottom: 14,
  },
  faultRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  faultIcon: {
    width: 48, height: 48,
    backgroundColor: Colors.warn,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  faultBadge: { color: Colors.warn, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  faultDevice: { color: Colors.text, fontSize: 15, fontWeight: '800', marginTop: 3 },
  faultDesc: { color: Colors.textSub, fontSize: 12, marginTop: 2 },
  faultTags: { flexDirection: 'row', gap: 8 },

  aiBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.purpleLight,
    borderWidth: 1,
    borderColor: '#d4cef0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  aiTitle: { color: Colors.purple, fontSize: 12, fontWeight: '800' },
  aiText: { color: Colors.textSub, fontSize: 11, lineHeight: 16, marginTop: 2 },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  sortLabel: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },
  sortChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sortChipText: { color: Colors.textSub, fontSize: 11, fontWeight: '600' },
  sortChipTextActive: { color: '#fff', fontWeight: '700' },

  firmCard: { marginBottom: 10, padding: 16 },
  firmRow: { flexDirection: 'row', gap: 12 },
  firmIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  firmTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  firmName: { color: Colors.text, fontSize: 14, fontWeight: '800' },
  firmRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  firmRating: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  firmReviews: { color: Colors.textMuted, fontSize: 11 },
  firmMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  firmMetaItem: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  firmMetaText: { color: Colors.textSub, fontSize: 11 },
  quoteBtn: {
    marginTop: 12,
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  quoteBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  commissionNote: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
