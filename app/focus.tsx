import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Button,
  Card,
  ErrorState,
  Label,
  Row,
  Screen,
  TextInput,
  colors,
} from "../src/components/ui";
import { owned, useApp } from "../src/store/app";
import { PRAYERS, type FocusSession, type PrayerName } from "../src/lib/models";
import { prayerLabel, useLanguage } from "../src/lib/i18n";
import { localDate, timerText } from "../src/lib/dates";
export default function Focus() {
  const params = useLocalSearchParams<{ prayer?: string }>();
  const router = useRouter();
  const { t, rtl } = useLanguage();
  const prayer: PrayerName = PRAYERS.find((p) => p === params.prayer) ?? "fajr";
  const [phase, setPhase] = useState<"prepare" | "scan" | "active" | "reflect">(
    "prepare",
  );
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState<FocusSession["confirmation"]>("manual");
  const [started, setStarted] = useState<Date | null>(null);
  const [ended, setEnded] = useState<Date | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [reflection, setReflection] = useState("");
  const sessionOwner = useRef(useApp.getState().owner);
  const saved = useRef(false);
  useEffect(() => {
    if (phase !== "active" || !started) return;
    const tick = () =>
      setSeconds(
        Math.max(0, Math.floor((Date.now() - started.getTime()) / 1000)),
      );
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, started]);
  function begin(method: FocusSession["confirmation"]) {
    setConfirmation(method);
    setStarted(new Date());
    setSeconds(0);
    setError("");
    setPhase("active");
  }
  if (phase === "active")
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          padding: 30,
          justifyContent: "center",
          gap: 30,
        }}
      >
        <Label gold style={{ textAlign: "center", letterSpacing: 3 }}>
          {t("SALAH FOCUS", "تركيز الصلاة")}
        </Label>
        <Label size={58} gold style={{ textAlign: "center" }}>
          ☽
        </Label>
        <Label size={32} style={{ textAlign: "center" }}>
          {prayerLabel(prayer, rtl)}
        </Label>
        <Label muted style={{ textAlign: "center" }}>
          {t("Set down your phone. Be present.", "ضع هاتفك جانبًا. كن حاضرًا.")}
        </Label>
        <Label
          size={46}
          style={{ textAlign: "center", fontVariant: ["tabular-nums"] }}
        >
          {timerText(seconds)}
        </Label>
        <Label muted size={12} style={{ textAlign: "center" }}>
          {t(
            "This timer records focus; it does not assess your worship or block other apps.",
            "يسجّل المؤقّت التركيز، ولا يقيّم عبادتك أو يحظر التطبيقات الأخرى.",
          )}
        </Label>
        <Button
          title={t("Finish & reflect", "أنهِ وتأمّل")}
          onPress={() => {
            setEnded(new Date());
            setPhase("reflect");
          }}
        />
        <Button
          title={t("Cancel without saving", "إلغاء دون حفظ")}
          variant="ghost"
          onPress={() => router.replace("/(tabs)/prayer")}
        />
      </SafeAreaView>
    );
  return (
    <Screen
      title={
        phase === "reflect"
          ? t("Carry the stillness with you.", "احمل السكينة معك.")
          : t("One moment of intention.", "لحظة نيّة.")
      }
      subtitle={t("SALAH FOCUS", "تركيز الصلاة")}
    >
      {error && <ErrorState message={error} />}
      {phase === "prepare" && (
        <Card accent>
          <Label size={26}>{prayerLabel(prayer, rtl)}</Label>
          <Label muted>
            {t(
              "Confirm you are ready, or scan your prayer mat. Scanning is optional and is not proof of prayer.",
              "أكّد استعدادك أو امسح رمز سجادة الصلاة. المسح اختياري ولا يُثبت أداء الصلاة.",
            )}
          </Label>
          <Button
            title={t("I’m ready — begin", "أنا مستعد — ابدأ")}
            onPress={() => begin("manual")}
          />
          <Button
            title={t("Scan prayer mat QR", "امسح رمز السجادة")}
            variant="secondary"
            onPress={() => {
              setError("");
              setPhase("scan");
            }}
          />
          <Label muted>
            {t(
              "NFC is unavailable in Expo Go and on web. Use QR or manual confirmation.",
              "NFC غير متاح في Expo Go وعلى الويب. استخدم QR أو التأكيد اليدوي.",
            )}
          </Label>
        </Card>
      )}
      {phase === "scan" && (
        <Card>
          <Label>
            {t(
              "Your mat QR must contain nurah://prayer-mat",
              "يجب أن يحتوي الرمز على nurah://prayer-mat",
            )}
          </Label>
          {Platform.OS === "web" ? (
            <Label muted>
              {t(
                "QR scanning is available on iOS/Android. Continue manually on web.",
                "مسح QR متاح على iOS وAndroid. تابع يدويًا على الويب.",
              )}
            </Label>
          ) : permission?.granted ? (
            <View style={{ height: 280, overflow: "hidden", borderRadius: 20 }}>
              <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => {
                  if (
                    data === "nurah://prayer-mat" ||
                    /^nurah:\/\/prayer-mat\/[a-zA-Z0-9_-]{1,80}$/.test(data)
                  )
                    begin("qr");
                  else
                    setError(
                      t(
                        "This is not a Nurah prayer-mat QR. Use manual confirmation if needed.",
                        "هذا ليس رمز سجادة نوراة. يمكنك التأكيد يدويًا.",
                      ),
                    );
                }}
              />
            </View>
          ) : (
            <>
              <Label muted>
                {t(
                  "Camera permission is needed only for this optional scan.",
                  "يلزم إذن الكاميرا لهذا المسح الاختياري فقط.",
                )}
              </Label>
              {permission && !permission.granted && !permission.canAskAgain && (
                <ErrorState
                  message={t(
                    "Camera permission denied. Enable it in device settings or continue manually.",
                    "رُفض إذن الكاميرا. فعّله من إعدادات الجهاز أو تابع يدويًا.",
                  )}
                />
              )}
              <Button
                title={t("Allow camera", "اسمح بالكاميرا")}
                onPress={() => {
                  void requestPermission().catch(() =>
                    setError(
                      t(
                        "Camera is unavailable. Continue manually.",
                        "الكاميرا غير متاحة. تابع يدويًا.",
                      ),
                    ),
                  );
                }}
              />
            </>
          )}
          <Button
            title={t("Confirm manually", "تأكيد يدوي")}
            onPress={() => begin("manual")}
          />
        </Card>
      )}
      {phase === "reflect" && (
        <Card>
          <Label gold>{t("A moment well spent", "لحظة طيبة")}</Label>
          <Label size={36}>
            {timerText(
              started && ended
                ? (ended.getTime() - started.getTime()) / 1000
                : seconds,
            )}
          </Label>
          <TextInput
            label={t("Optional private reflection", "تأمّل خاص اختياري")}
            placeholder={t(
              "What will you carry into your day?",
              "ماذا ستحمل معك إلى يومك؟",
            )}
            multiline
            maxLength={1000}
            value={reflection}
            onChangeText={setReflection}
          />
          <Label muted size={12}>
            {t(
              "Keep sensitive details out. Reflections sync to your private account when signed in.",
              "تجنّب التفاصيل الحساسة. تتم مزامنة التأمّلات إلى حسابك الخاص عند الدخول.",
            )}
          </Label>
          <Button
            title={t("Save session & mark prayed", "احفظ الجلسة وسجّل الصلاة")}
            onPress={() => {
              if (!started || !ended || saved.current) return;
              const state = useApp.getState();
              if (state.owner !== sessionOwner.current) {
                setError(
                  t(
                    "Your account changed. This session was not saved. Start a new session.",
                    "تغيّر حسابك. لم تُحفظ الجلسة. ابدأ جلسة جديدة.",
                  ),
                );
                return;
              }
              saved.current = true;
              state.put("focus_sessions", {
                ...owned(),
                prayer,
                started_at: started.toISOString(),
                ended_at: ended.toISOString(),
                duration_seconds: Math.max(
                  0,
                  Math.floor((ended.getTime() - started.getTime()) / 1000),
                ),
                reflection: reflection.trim(),
                confirmation,
              });
              const date = localDate(ended);
              const existing = state.records.prayer_logs.find(
                (p) => p.date === date && p.prayer === prayer,
              );
              state.put("prayer_logs", {
                ...(existing ?? owned()),
                date,
                prayer,
                status: "prayed",
              });
              router.replace("/(tabs)/prayer");
            }}
          />
        </Card>
      )}
      <Row>
        <Button
          title={t("Back to prayer", "العودة للصلاة")}
          variant="ghost"
          onPress={() => router.replace("/(tabs)/prayer")}
        />
      </Row>
    </Screen>
  );
}
