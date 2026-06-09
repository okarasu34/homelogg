import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import { Colors, Radius, Shadow } from '../src/constants/theme';
import { useLang } from '../src/lib/LangContext';

export default function AuthScreen() {
  const { t } = useLang();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e.message || 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <View style={styles.logoRoof} />
              <View style={styles.logoBodyLeft} />
              <View style={styles.logoBodyRight} />
              <View style={styles.logoDoor} />
            </View>
            <Text style={styles.appName}>Husbok</Text>
            <Text style={styles.appSlogan}>Din bolig. Din historikk.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {mode === 'signin' ? t.welcomeBack : t.createAccount}
            </Text>

            {mode === 'signup' && (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{t.fullName}</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Bjørn Hansen"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t.email}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="bjorn@example.no"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t.password}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'signin' ? t.signIn : t.signUp}
                </Text>
              )}
            </TouchableOpacity>

            {mode === 'signin' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>{t.forgotPassword}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Switch mode */}
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          >
            <Text style={styles.switchText}>
              {mode === 'signin' ? t.noAccount : t.hasAccount}{' '}
              <Text style={styles.switchLink}>
                {mode === 'signin' ? t.signUp : t.signIn}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>{t.terms}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },

  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 72, height: 72,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', position: 'relative',
    marginBottom: 14,
    ...Shadow.md,
  },
  logoRoof: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 32,
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 17, borderTopRightRadius: 17,
  },
  logoBodyLeft: {
    position: 'absolute', bottom: 0, left: 0, width: 36, height: 40,
    backgroundColor: '#e8610a',
  },
  logoBodyRight: {
    position: 'absolute', bottom: 0, right: 0, width: 36, height: 40,
    backgroundColor: Colors.accent,
  },
  logoDoor: {
    position: 'absolute', bottom: 0, left: 29, width: 14, height: 20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
  },
  appName: { fontSize: 28, fontWeight: '900', color: Colors.text },
  appSlogan: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    ...Shadow.md,
  },
  cardTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 20 },

  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSub, marginBottom: 6 },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 13,
    fontSize: 14,
    color: Colors.text,
  },

  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: Colors.danger, fontSize: 12, fontWeight: '600' },

  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    ...Shadow.md,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  forgotBtn: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: Colors.textSub, fontSize: 12 },

  switchBtn: { alignItems: 'center', marginBottom: 16 },
  switchText: { color: Colors.textSub, fontSize: 13 },
  switchLink: { color: Colors.accent, fontWeight: '800' },

  terms: { color: Colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 15 },
});
