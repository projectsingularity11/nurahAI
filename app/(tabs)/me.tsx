import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Button,
  Card,
  Label,
  Row,
  Screen,
  SectionHeader,
  TextInput,
} from "../../src/components/ui";
import { Account } from "../../src/components/Account";
import { HabitsTasks } from "../../src/components/HabitsTasks";
import { useApp } from "../../src/store/app";
import { useLanguage } from "../../src/lib/i18n";
export default function Me() {
  const profile = useApp((s) => s.profile);
  const update = useApp((s) => s.updateProfile);
  const sessions = useApp((s) => s.records.focus_sessions);
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  return (
    <Screen
      title={t("Grow at your own pace.", "انمُ بوتيرتك الخاصة.")}
      subtitle={t("ME · INTENTION INTO ACTION", "أنا · من النيّة إلى العمل")}
    >
      <Account />
      <HabitsTasks />
      <Card>
        <SectionHeader title={t("Preferences", "التفضيلات")} />
        <TextInput
          label={t("Name", "الاسم")}
          value={name}
          onChangeText={setName}
          maxLength={80}
        />
        <Button
          title={t("Save name", "احفظ الاسم")}
          disabled={!name.trim()}
          onPress={() => update({ name: name.trim() })}
        />
        <Row>
          <Button
            title="English"
            variant={profile.locale === "en" ? "primary" : "secondary"}
            onPress={() => update({ locale: "en" })}
          />
          <Button
            title="العربية"
            variant={profile.locale === "ar" ? "primary" : "secondary"}
            onPress={() => update({ locale: "ar" })}
          />
        </Row>
        <Button
          title={
            profile.notifications
              ? t("Reminders preference: on", "تفضيل التذكيرات: مفعّل")
              : t("Reminders preference: off", "تفضيل التذكيرات: متوقف")
          }
          variant="secondary"
          onPress={() => update({ notifications: !profile.notifications })}
        />
        <Label muted size={12}>
          {t(
            "Preference only; notification delivery is not enabled in Part 1.",
            "تفضيل فقط؛ إرسال الإشعارات غير مفعّل في الجزء الأول.",
          )}
        </Label>
        <Button
          title={t("Prayer & location settings", "إعدادات الصلاة والموقع")}
          variant="ghost"
          onPress={() => router.push("/(tabs)/prayer")}
        />
      </Card>
      <Card>
        <SectionHeader title={t("Your focus journey", "رحلتك مع التركيز")} />
        <Label size={28} gold>
          {sessions.length} {t("sessions", "جلسات")}
        </Label>
        <Label muted>
          {Math.floor(
            sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60,
          )}{" "}
          {t("minutes of presence", "دقيقة من الحضور")}
        </Label>
        {sessions
          .slice(-5)
          .reverse()
          .map((s) => (
            <Label key={s.id} muted size={13}>
              {new Date(s.ended_at).toLocaleDateString(profile.locale)} ·{" "}
              {Math.floor(s.duration_seconds / 60)} {t("min", "دقيقة")}
              {s.reflection ? ` · ${s.reflection}` : ""}
            </Label>
          ))}
      </Card>
      <Label muted size={12}>
        {t(
          "Nurah AI · Part 1. No social features, payments, fatwas, or expanded libraries.",
          "نوراة AI · الجزء الأول. دون ميزات اجتماعية أو مدفوعات أو فتاوى أو مكتبات موسّعة.",
        )}
      </Label>
    </Screen>
  );
}
