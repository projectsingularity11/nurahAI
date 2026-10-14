import { useRouter } from "expo-router";
import { Button, EmptyState, Screen } from "../src/components/ui";
import { useLanguage } from "../src/lib/i18n";
export default function NotFound() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <Screen title={t("Page not found", "الصفحة غير موجودة")}>
      <EmptyState
        title={t("Find your way back", "عُد إلى مسارك")}
        message={t("This route does not exist.", "هذا المسار غير موجود.")}
      />
      <Button
        title={t("Go home", "الرئيسية")}
        onPress={() => router.replace("/")}
      />
    </Screen>
  );
}
