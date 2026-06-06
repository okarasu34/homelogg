import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, Shadow } from '../constants/theme';

// ── Card ─────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}
export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.card, Shadow.sm, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, Shadow.sm, style]}>{children}</View>;
}

// ── Tag ──────────────────────────────────────────────────────
interface TagProps {
  label: string;
  color: string;
  bg: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
export function Tag({ label, color, bg, style, textStyle }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }, style]}>
      <Text style={[styles.tagText, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

// ── Button ───────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  style?: ViewStyle;
  icon?: string;
}
export function Button({ label, onPress, variant = 'primary', loading, style, icon }: ButtonProps) {
  const bg =
    variant === 'primary'
      ? Colors.accent
      : variant === 'secondary'
      ? Colors.accentLight
      : 'transparent';
  const color =
    variant === 'primary'
      ? Colors.white
      : variant === 'secondary'
      ? Colors.accent
      : Colors.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
      style={[
        styles.button,
        { backgroundColor: bg },
        variant === 'primary' && Shadow.md,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color }]}>
          {icon ? `${icon} ` : ''}{label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── ScoreRing ─────────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  max: number;
  size?: number;
  color?: string;
  trackColor?: string;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  labelColor?: string;
  sublabelColor?: string;
}
export function ScoreRing({
  score,
  max,
  size = 76,
  color = Colors.white,
  trackColor = 'rgba(255,255,255,0.2)',
  strokeWidth = 5,
  label,
  sublabel,
  labelColor = Colors.white,
  sublabelColor = 'rgba(255,255,255,0.6)',
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / max) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* SVG-like ring using borderRadius trick */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />
      {/* Progress arc — approximate with border trick */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && (
          <Text style={{ color: labelColor, fontSize: size * 0.2, fontWeight: '800' }}>
            {label}
          </Text>
        )}
        {sublabel && (
          <Text style={{ color: sublabelColor, fontSize: size * 0.1, fontWeight: '600' }}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── SectionLabel ─────────────────────────────────────────────
export function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
  );
}

// ── Divider ───────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ── BackButton ────────────────────────────────────────────────
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.backBtn}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>
  );
}

// ── EnergyBar ─────────────────────────────────────────────────
interface EnergyBarProps {
  grade: string;
}
export function EnergyBar({ grade }: EnergyBarProps) {
  const grades = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const colors = ['#2d6a4f', '#4a9e72', '#76c893', '#b7e4c7', '#f4a261', '#e76f51', '#c0392b'];
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {grades.map((g, i) => (
          <View key={g} style={{ flex: 1 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: g === grade ? colors[i] : 'rgba(0,0,0,0.1)',
              }}
            />
            {g === grade && (
              <Text style={{ textAlign: 'center', color: colors[i], fontSize: 9, fontWeight: '900', marginTop: 2 }}>
                ▼
              </Text>
            )}
            <Text style={{ textAlign: 'center', color: Colors.textSub, fontSize: 9, fontWeight: '700', marginTop: g !== grade ? 4 : 0 }}>
              {g}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  button: {
    borderRadius: Radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  backArrow: {
    color: Colors.text,
    fontSize: 18,
  },
});
