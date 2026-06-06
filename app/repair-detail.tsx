import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { Card, BackButton } from '../src/components/UI';
import { useLang } from '../src/lib/LangContext';

export default function RepairDetailScreen() {
  const { t } = useLang();
  const params = useLocalSearchParams();
  const [booked, setBooked] = useState(false);

  const firmName = (params.firmName as string) ?? 'Hansen Hvitevarer AS';
  const firmRating = parseFloat((params.firmRating as string) ?? '4.9');
  const firmReviews = parseInt((params.firmReviews as string) ?? '142');
  const firmDistance = (params.firmDistance as string) ?? '1,2 km';
  const firmPrice = (params.firmPrice as string) ?? 'kr 490–890';
  const firmEta = (params.firmEta as string) ?? 'I dag';
  const firmIcon = (params.firmIcon as string) ?? '🔧';

  if (booked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.bookedWrap}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={styles.bookedTitle}>{t.bookingConfirmed}</Text>
          <Text style={styles.bookedSub}>{t.bookingConfirmedSub}</Text>
          <View style={styles.bookedDetail}>
            <Text style={styles.bookedDetailTitle}>{t.addedToLog}</Text>
            {[
              { label: 'Enhet', value: 'Oppvaskmaskin — Bosch' },
              { label: 'Firma', value: firmName },
              { label: 'Dato', value: 'I dag' },
              { label: 'Est. pris', value: firmPrice },
            ].map((r, i) => (
              <View key={i} style={[styles.bookedRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
                <Text style={styles.bookedRowLabel}>{r.label}</Text>
                <Text style={styles.bookedRowVal}>{r.value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Tilbake til Hjem</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title} numberOfLines={1}>{firmName}</Text>
        </View>

        {/* Firm header */}
        <View style={styles.firmHeader}>
          <View style={styles.firmHeaderRow}>
            <View style={styles.firmIcon}>
              <Text style={{ fontSize: 28 }}>{firmIcon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.firmName}>{firmName}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={{ color: i < Math.floor(firmRating) ? Colors.gold : Colors.border, fontSize: 14 }}>★</Text>
                ))}
                <Text style={styles.ratingText}>{firmRating} ({firmReviews})</Text>
              </View>
            </View>
          </View>
          <View style={styles.metaGrid}>
            {[
              { icon: '📍', label: t.distance, value: firmDistance },
              { icon: '💰', label: t.estPrice, value: firmPrice },
              { icon: '🕐', label: t.available2, value: firmEta },
            ].map((m, i) => (
              <View key={i} style={styles.metaItem}>
                <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                <Text style={styles.metaValue}>{m.value}</Text>
                <Text style={styles.metaLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <Text style={styles.reviewsTitle}>{t.recentReviews}</Text>
        {[
          { name: 'Lars M.', stars: 5, text: 'Fikset samme dag, veldig profesjonelt.', time: '1 uke siden' },
          { name: 'Ingrid K.', stars: 5, text: 'Bra pris, rask respons.', time: '2 uker siden' },
        ].map((review, i) => (
          <Card key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{review.name[0]}</Text>
              </View>
              <Text style={styles.reviewName}>{review.name}</Text>
              <Text style={styles.reviewTime}>{review.time}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              {Array.from({ length: review.stars }).map((_, i) => (
                <Text key={i} style={{ color: Colors.gold, fontSize: 12 }}>★</Text>
              ))}
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
          </Card>
        ))}

        {/* Auto-log note */}
        <View style={styles.autoLogBox}>
          <Text style={styles.autoLogTitle}>🤖 {t.autoLog}</Text>
          <Text style={styles.autoLogText}>{t.autoLogText}</Text>
        </View>

        {/* Book button */}
        <TouchableOpacity style={styles.bookBtn} onPress={() => setBooked(true)}>
          <Text style={styles.bookBtnText}>{t.requestQuote} — {firmName} →</Text>
        </TouchableOpacity>
        <Text style={styles.commissionNote}>{t.commissionNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '900', flex: 1 },

  firmHeader: {
    backgroundColor: '#e8f5ef',
    borderWidth: 1,
    borderColor: '#b8e0cc',
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 16,
  },
  firmHeaderRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 },
  firmIcon: {
    width: 56, height: 56,
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  firmName: { color: Colors.text, fontSize: 16, fontWeight: '900' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  ratingText: { color: Colors.textSub, fontSize: 12, marginLeft: 4 },
  metaGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  metaItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  metaValue: { color: Colors.text, fontSize: 12, fontWeight: '800', marginTop: 3 },
  metaLabel: { color: Colors.textSub, fontSize: 10 },

  reviewsTitle: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  reviewCard: { padding: 14, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewAvatar: {
    width: 28, height: 28,
    backgroundColor: Colors.accentLight,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  reviewName: { color: Colors.text, fontSize: 13, fontWeight: '700', flex: 1 },
  reviewTime: { color: Colors.textMuted, fontSize: 11 },
  reviewText: { color: Colors.textSub, fontSize: 12 },

  autoLogBox: {
    backgroundColor: Colors.purpleLight,
    borderWidth: 1,
    borderColor: '#d4cef0',
    borderRadius: 14,
    padding: 14,
    marginVertical: 16,
  },
  autoLogTitle: { color: Colors.purple, fontSize: 12, fontWeight: '800' },
  autoLogText: { color: Colors.textSub, fontSize: 11, lineHeight: 16, marginTop: 4 },

  bookBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  commissionNote: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 },

  bookedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bookedTitle: { color: Colors.accent, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  bookedSub: { color: Colors.textSub, fontSize: 14, marginBottom: 24, textAlign: 'center' },
  bookedDetail: {
    width: '100%',
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.accentSoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  bookedDetailTitle: { color: Colors.accent, fontSize: 13, fontWeight: '800', marginBottom: 10 },
  bookedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  bookedRowLabel: { color: Colors.textSub, fontSize: 12 },
  bookedRowVal: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  homeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    ...Shadow.md,
  },
  homeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
