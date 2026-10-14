import { useState } from "react";
import { Button, Card, ErrorState, Label, TextInput } from "./ui";
import { supabase } from "../lib/supabase";
import { useApp } from "../store/app";
import { syncAccount } from "../services/sync";
import { useLanguage } from "../lib/i18n";
export function Account() {
  const owner = useApp((s) => s.owner);
  const syncing = useApp((s) => s.syncing);
  const pending = useApp((s) => s.pending.length);
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function authenticate(signup = false) {
    if (!supabase) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data, error: authError } = signup
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
      if (authError) throw authError;
      setPassword("");
      if (signup && !data.session)
        setMessage(
          t(
            "Check your email to confirm your account, then return here and sign in.",
            "تحقّق من بريدك لتأكيد الحساب، ثم عُد وسجّل الدخول.",
          ),
        );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("Sign-in failed.", "فشل تسجيل الدخول."),
      );
    } finally {
      setLoading(false);
    }
  }
  if (!supabase)
    return (
      <Card>
        <Label size={20}>{t("Your private space", "مساحتك الخاصة")}</Label>
        <Label muted>
          {t(
            "Supabase is not configured. You can use every local feature as a guest. Add the public environment variables to enable accounts and sync.",
            "لم يُضبط Supabase. يمكنك استخدام الميزات المحلية كضيف. أضف متغيرات البيئة العامة لتفعيل الحساب والمزامنة.",
          )}
        </Label>
      </Card>
    );
  return (
    <Card>
      <Label size={20}>
        {owner === "guest"
          ? t("Keep your progress with you", "احمل تقدّمك معك")
          : t("Your private account", "حسابك الخاص")}
      </Label>
      {error && <ErrorState message={error} />}
      {message && <Label gold>{message}</Label>}
      {owner === "guest" ? (
        <>
          <Label muted>
            {t(
              "Account data is separate from guest data. Signing out returns you to your local guest space.",
              "بيانات الحساب مستقلة عن بيانات الضيف. تسجيل الخروج يعيدك إلى مساحة الضيف المحلية.",
            )}
          </Label>
          <TextInput
            label={t("Email", "البريد الإلكتروني")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            label={t("Password", "كلمة المرور")}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            autoComplete="current-password"
          />
          <Button
            title={t("Sign in", "دخول")}
            disabled={!email.trim() || password.length < 8}
            loading={loading}
            onPress={() => {
              void authenticate();
            }}
          />
          <Button
            title={t("Create account", "إنشاء حساب")}
            variant="secondary"
            disabled={!email.trim() || password.length < 8}
            loading={loading}
            onPress={() => {
              void authenticate(true);
            }}
          />
          <Label muted size={12}>
            {t(
              "Use at least 8 characters. Email confirmation may be required.",
              "استخدم ٨ أحرف على الأقل. قد يلزم تأكيد البريد.",
            )}
          </Label>
        </>
      ) : (
        <>
          <Label muted>
            {t(
              `${pending} changes waiting to sync`,
              `${pending} تغييرات بانتظار المزامنة`,
            )}
          </Label>
          <Button
            title={t("Sync now", "زامن الآن")}
            loading={syncing}
            onPress={() => {
              void syncAccount();
            }}
          />
          <Button
            title={t("Sign out", "خروج")}
            variant="secondary"
            loading={loading}
            onPress={() => {
              if (!supabase) return;
              setLoading(true);
              setError("");
              void supabase.auth
                .signOut()
                .then(({ error: signOutError }) => {
                  if (signOutError) setError(signOutError.message);
                  else useApp.getState().switchOwner("guest");
                })
                .catch(() =>
                  setError(
                    t(
                      "Could not sign out. Try again.",
                      "تعذّر تسجيل الخروج. حاول مرة أخرى.",
                    ),
                  ),
                )
                .finally(() => setLoading(false));
            }}
          />
        </>
      )}
    </Card>
  );
}
