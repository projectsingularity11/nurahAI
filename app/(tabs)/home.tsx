import { useRouter } from "expo-router";
import { View } from "react-native";
import {
  Button,
  Card,
  Label,
  ProgressRing,
  Row,
  Screen,
  SectionHeader,
} from "../../src/components/ui";
import { HadithCard } from "../../src/components/HadithCard";
import { useApp } from "../../src/store/app";
import { usePrayer } from "../../src/hooks/usePrayer";
import { prayerLabel, useLanguage } from "../../src/lib/i18n";
import { localDate, timerText } from "../../src/lib/dates";
export default function Home() {
  const profile = useApp((s) => s.profile);
  const records = useApp((s) => s.records);
  const { t, rtl } = useLanguage();
  const router = useRouter();
  const prayer = usePrayer();
  const today = localDate(prayer.now);
  const completed = records.prayer_logs.filter(
    (r) => r.date === today && (r.status === "prayed" || r.status === "late"),
  ).length;
  const progress = records.reading_progress[0];
  return (
    <Screen
      title={t(
        `Assalamu alaikum, ${profile.name}.`,
        `السلام عليكم، ${profile.name}.`,
      )}
      subtitle={t("A NEW DAY. A RENEWED INTENTION.", "يوم جديد. نيّة متجددة.")}
    >
      <Card accent>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Label gold size={12}>
              {t("YOUR NEXT MOMENT OF STILLNESS", "لحظتك القادمة من السكينة")}
            </Label>
            <Label size={34}>
              {prayer.next
                ? prayerLabel(prayer.next.name, rtl)
                : t("Begin with prayer", "ابدأ بالصلاة")}
            </Label>
            <Label muted>
              {prayer.next
                ? `${prayer.next.time.toLocaleTimeString(profile.locale, { hour: "2-digit", minute: "2-digit" })} · ${timerText((prayer.next.time.getTime() - prayer.now.getTime()) / 1000)}`
                : t(
                    "Set your location to see prayer times",
                    "حدّد موقعك لعرض مواقيت الصلاة",
                  )}
            </Label>
          </View>
          <ProgressRing
            value={completed}
            total={5}
            label={t("PRAYERS", "صلوات")}
          />
        </Row>
        <Button
          title={t("Go to prayer", "اذهب إلى الصلاة")}
          icon="moon-outline"
          onPress={() => router.push("/(tabs)/prayer")}
        />
      </Card>
      <SectionHeader
        title={t("Make space today", "افسح مساحة اليوم")}
        note={prayer.now.toLocaleDateString(profile.locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      />
      <Row style={{ flexWrap: "wrap", alignItems: "stretch" }}>
        <Card style={{ flex: 1, minWidth: 220 }}>
          <Label gold size={12}>
            {t("READ & REFLECT", "اقرأ وتأمّل")}
          </Label>
          <Label size={22}>
            {t("A few ayahs. A fresh perspective.", "آيات قليلة. نظرة جديدة.")}
          </Label>
          <Label muted>
            {progress
              ? t(
                  `Continue at ${progress.surah}:${progress.ayah}`,
                  `تابع عند ${progress.surah}:${progress.ayah}`,
                )
              : t("Begin your Qur’an journey", "ابدأ رحلتك مع القرآن")}
          </Label>
          <Button
            title={t("Open Qur’an", "افتح القرآن")}
            variant="secondary"
            onPress={() =>
              router.push(
                progress
                  ? {
                      pathname: "/(tabs)/quran",
                      params: { surah: progress.surah, ayah: progress.ayah },
                    }
                  : "/(tabs)/quran",
              )
            }
          />
        </Card>
        <Card style={{ flex: 1, minWidth: 220 }}>
          <Label gold size={12}>
            {t("SMALL, CONSISTENT STEPS", "خطوات صغيرة مستمرة")}
          </Label>
          <Label size={22}>
            {
              records.habits.filter((h) => h.completed_dates.includes(today))
                .length
            }
            /{records.habits.length} {t("habits today", "عادات اليوم")}
          </Label>
          <Label muted>
            {records.tasks.filter((task) => !task.completed).length}{" "}
            {t("tasks left to do", "مهام متبقية")}
          </Label>
          <Button
            title={t("My habits & tasks", "عاداتي ومهامي")}
            variant="secondary"
            onPress={() => router.push("/(tabs)/me")}
          />
        </Card>
      </Row>
      <SectionHeader title={t("A reminder for the heart", "تذكير للقلب")} />
      <HadithCard />
      <Card>
        <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Label size={22}>
              {t("Remember. Recenter.", "اذكر. استعد اتزانك.")}
            </Label>
            <Label muted>
              {t(
                "A quiet moment of dhikr can fit into your day.",
                "لحظة هادئة من الذكر في يومك.",
              )}
            </Label>
          </View>
          <Button
            title={t("Dhikr & learning", "الذكر والتعلّم")}
            variant="secondary"
            onPress={() => router.push("/(tabs)/learn")}
          />
        </Row>
      </Card>
      <Button
        title={t("Ask Nurah · study & planning", "اسأل نوراة · تعلّم وتنظيم")}
        variant="ghost"
        icon="sparkles-outline"
        onPress={() => router.push("/assistant")}
      />
    </Screen>
  );
}
