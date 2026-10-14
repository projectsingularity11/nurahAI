import { useState } from "react";
import { Linking, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Card,
  ErrorState,
  Label,
  LoadingState,
  Screen,
  TextInput,
} from "../src/components/ui";
import { askAssistant } from "../src/services/assistant";
import { id } from "../src/store/app";
import { useLanguage } from "../src/lib/i18n";
import type { ChatMessage } from "../src/lib/models";
export default function Assistant() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    if (!input.trim() || loading) return;
    const message = input.trim();
    setInput("");
    setError("");
    setLoading(true);
    setMessages((m) => [
      ...m,
      { id: id(), role: "user", text: message, sources: [] },
    ]);
    try {
      const reply = await askAssistant(message, locale);
      setMessages((m) => [...m, { id: id(), role: "assistant", ...reply }]);
    } catch {
      setError(
        t(
          "Assistant unavailable. Please try again.",
          "المساعد غير متاح. حاول مرة أخرى.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <Screen
      title={t("Room for a thoughtful question.", "مساحة لسؤال متأنٍ.")}
      subtitle={t("ASSISTANT · PLACEHOLDER SERVICE", "المساعد · خدمة تجريبية")}
      action={
        <Button
          title={t("Back", "رجوع")}
          variant="ghost"
          onPress={() => router.back()}
        />
      }
    >
      <Card>
        <Label muted>
          {t(
            "A study and organization tool, not a fatwa service. No model or live retrieval is connected. Messages stay in this screen and are not uploaded. Avoid sensitive personal details.",
            "أداة للتعلّم والتنظيم وليست خدمة فتاوى. لا يوجد نموذج أو استرجاع مصادر حيّ. الرسائل تبقى في هذه الشاشة ولا تُرفع. تجنّب التفاصيل الحساسة.",
          )}
        </Label>
        <Button
          title={t("Help me plan one habit", "ساعدني في تخطيط عادة")}
          variant="secondary"
          onPress={() =>
            setInput(t("Help me plan one habit", "ساعدني في تخطيط عادة"))
          }
        />
        <Button
          title={t("Show the intentions hadith", "اعرض حديث النيّات")}
          variant="secondary"
          onPress={() =>
            setInput(t("Show the intentions hadith", "اعرض حديث النيات"))
          }
        />
      </Card>
      {messages.map((m) => (
        <Card key={m.id} accent={m.refused}>
          <Label gold size={12}>
            {m.role === "user"
              ? t("YOU", "أنت")
              : m.refused
                ? t("SCHOLAR GUIDANCE REQUIRED", "يلزم إرشاد عالم مؤهّل")
                : t("NURAH · PLACEHOLDER", "نوراة · تجريبي")}
          </Label>
          <Label>{m.text}</Label>
          {m.role === "assistant" && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#2B4137",
                paddingTop: 12,
                gap: 8,
              }}
            >
              <Label gold size={12}>
                {t("SOURCE PANEL", "لوحة المصادر")}
              </Label>
              {m.sources.map((s, i) => (
                <View key={i}>
                  <Label size={14}>{s.label}</Label>
                  <Label muted size={12}>
                    {s.detail}
                  </Label>
                  {s.url && (
                    <Button
                      title={t("View source ↗", "اعرض المصدر ↗")}
                      variant="ghost"
                      onPress={() => {
                        if (s.url?.startsWith("https://"))
                          void Linking.openURL(s.url).catch(() =>
                            setError(
                              t("Could not open source.", "تعذّر فتح المصدر."),
                            ),
                          );
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      <TextInput
        label={t("Your question", "سؤالك")}
        placeholder={t(
          "A small habit, a study question…",
          "عادة صغيرة، سؤال للتعلّم…",
        )}
        value={input}
        onChangeText={setInput}
        multiline
        maxLength={2000}
      />
      <Button
        title={t("Send", "أرسل")}
        loading={loading}
        disabled={!input.trim()}
        onPress={() => {
          void send();
        }}
      />
      {!!messages.length && (
        <Button
          title={t("Clear conversation", "امسح المحادثة")}
          variant="ghost"
          disabled={loading}
          onPress={() => setMessages([])}
        />
      )}
    </Screen>
  );
}
