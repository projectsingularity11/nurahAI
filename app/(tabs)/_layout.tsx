import { Tabs, Redirect } from "expo-router";
import { colors, LoadingState } from "../../src/components/ui";
import { useLanguage } from "../../src/lib/i18n";
import { TabBar } from "../../src/components/TabBar";
import { useApp } from "../../src/store/app";
export default function TabLayout() {
  const { t } = useLanguage();
  const hydrated = useApp((s) => s.hydrated);
  const onboarded = useApp((s) => s.profile.onboarded);
  if (!hydrated) return <LoadingState />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("Today", "اليوم"),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: t("Prayer", "الصلاة"),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: t("Qur’an", "القرآن"),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t("Learn", "تعلّم"),
        }}
      />
      <Tabs.Screen name="me" options={{ title: t("Me", "أنا") }} />
    </Tabs>
  );
}
