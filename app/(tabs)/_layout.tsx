import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { useLang } from '../../src/lib/LangContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label={t.nav.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="energy"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚡" label={t.nav.energy} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" label={t.nav.import} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔧" label={t.nav.devices} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏷️" label={t.nav.sell} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.navBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 20,
    height: 72,
  },
  tabItem: {
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.accentLight,
  },
  emoji: {
    fontSize: 17,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.accent,
  },
});
