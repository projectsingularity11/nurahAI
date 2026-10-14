import { useRouter } from "expo-router";
import {
  Button,
  Card,
  Label,
  Screen,
  SectionHeader,
} from "../../src/components/ui";
import { HadithCard } from "../../src/components/HadithCard";
import { Dhikr } from "../../src/components/Dhikr";
import { useLanguage } from "../../src/lib/i18n";
export default function Learn() {
  const { t } = useLanguage();
  const router = useRouter();
  return (
    <Screen
      title={t("Nourish your day.", "غذّ يومك.")}
      subtitle={t("LEARN · REMEMBER · REFLECT", "تعلّم · اذكر · تأمّل")}
    >
      <SectionHeader title={t("A daily reminder", "تذكير يومي")} />
      <HadithCard />
      <Dhikr />
      <Card>
        <Label size={24}>{t("A thoughtful companion", "رفيق للتأمّل")}</Label>
        <Label muted>
          {t(
            "Ask for study help or a simple plan. Nurah does not issue personal religious rulings.",
            "اطلب مساعدة في الدراسة أو خطة بسيطة. نوراة لا تصدر أحكامًا دينية شخصية.",
          )}
        </Label>
        <Button
          title={t("Open assistant", "افتح المساعد")}
          onPress={() => router.push("/assistant")}
          icon="sparkles-outline"
        />
      </Card>
    </Screen>
  );
}
