import { Linking } from "react-native";
import { useState } from "react";
import { DAILY_HADITH as hadith } from "../data/hadith";
import { Button, Card, ErrorState, Label } from "./ui";
import { useLanguage } from "../lib/i18n";
export function HadithCard() {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  return (
    <Card>
      <Label gold size={12}>
        {t(
          "DAILY HADITH · SEED DATA · EXCERPT",
          "حديث اليوم · بيانات تجريبية · مقتطف",
        )}
      </Label>
      <Label
        size={25}
        style={{ writingDirection: "rtl", textAlign: "right", lineHeight: 45 }}
      >
        {hadith.arabic}
      </Label>
      <Label size={17}>{hadith.english}</Label>
      <Label muted size={13}>
        {hadith.collection} · {t("Hadith", "حديث")} {hadith.number}
      </Label>
      <Label muted size={13}>
        {t(
          "Narrator: Umar ibn al-Khattab · Grade: Sahih",
          "الراوي: عمر بن الخطاب · الدرجة: صحيح",
        )}
      </Label>
      <Label muted size={12}>
        {t(
          "Fixed seed excerpt with a paraphrased English meaning. Not a live daily feed; verify against the full source.",
          "مقتطف ثابت للتجربة مع معنى إنجليزي مُعاد الصياغة. ليست خدمة يومية حيّة؛ راجع المصدر الكامل.",
        )}
      </Label>
      {error && <ErrorState message={error} />}
      <Button
        title={t("Read the full source ↗", "اقرأ المصدر الكامل ↗")}
        variant="ghost"
        onPress={() => {
          void Linking.openURL(hadith.source_url).catch(() =>
            setError(
              t(
                "Could not open source. Try again when online.",
                "تعذّر فتح المصدر. حاول عند الاتصال.",
              ),
            ),
          );
        }}
      />
    </Card>
  );
}
