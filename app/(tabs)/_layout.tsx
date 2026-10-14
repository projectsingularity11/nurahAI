import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, LoadingState } from '../../src/components/ui';
import { useLanguage } from '../../src/lib/i18n';
import { useApp } from '../../src/store/app';
export default function TabLayout() {
  const { t, rtl } = useLanguage();
  const hydrated = useApp((s) => s.hydrated); const onboarded = useApp((s) => s.profile.onboarded);
  if (!hydrated) return <LoadingState />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  const icon = (name: keyof typeof Ionicons.glyphMap) => function TabIcon({ color, size }: { color: string; size: number }) { return <Ionicons name={name} color={color} size={size} />; };
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.gold, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.canvas, borderTopColor: colors.border, height: 76, paddingBottom: 12, paddingTop: 8, flexDirection: rtl ? 'row-reverse' : 'row' }, sceneStyle: { backgroundColor: colors.canvas } }}>
    <Tabs.Screen name="home" options={{ title: t('Today', 'اليوم'), tabBarIcon: icon('grid-outline') }} />
    <Tabs.Screen name="prayer" options={{ title: t('Prayer', 'الصلاة'), tabBarIcon: icon('moon-outline') }} />
    <Tabs.Screen name="quran" options={{ title: t('Qur’an', 'القرآن'), tabBarIcon: icon('book-outline') }} />
    <Tabs.Screen name="learn" options={{ title: t('Learn', 'تعلّم'), tabBarIcon: icon('sparkles-outline') }} />
    <Tabs.Screen name="me" options={{ title: t('Me', 'أنا'), tabBarIcon: icon('person-outline') }} />
  </Tabs>;
}
