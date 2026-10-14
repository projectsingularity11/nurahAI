import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Card, Label, Row, Screen, TextInput } from '../src/components/ui';
import { LocationCard } from '../src/components/LocationCard';
import { MethodPicker } from '../src/components/MethodPicker';
import { useLanguage } from '../src/lib/i18n';
import { useApp } from '../src/store/app';
export default function Onboarding() {
  const [step, setStep] = useState(0); const router = useRouter();
  const profile = useApp((s) => s.profile); const update = useApp((s) => s.updateProfile); const { t } = useLanguage();
  const titles = [t('Make room for what matters.', 'مساحة لما يهمّك.'), t('What should we call you?', 'بماذا نناديك؟'), t('Prayer, wherever you are.', 'صلاتك، أينما كنت.'), t('Follow your local method.', 'اتّبع طريقة الحساب المحلية.'), t('A gentle reminder.', 'تذكير لطيف.')];
  return <Screen title={titles[step] ?? ''} subtitle={t(`YOUR BEGINNING · ${step + 1} OF 5`, `بدايتك · ${step + 1} من ٥`)} action={<Button title={profile.locale === 'en' ? 'العربية' : 'English'} variant="ghost" onPress={() => update({ locale: profile.locale === 'en' ? 'ar' : 'en' })} />}>
    <Row>{titles.map((_, i) => <View key={i} style={{ flex: 1, height: 3, borderRadius: 3, backgroundColor: i <= step ? '#D6BE85' : '#2B4137' }} />)}</Row>
    {step === 0 && <Card accent><Label size={68} gold style={{ textAlign: 'center' }}>☽</Label><Label size={28}>{t('A calmer day. A closer heart.', 'يوم أهدأ. قلب أقرب.')}</Label><Label muted>{t('Prayer, Qur’an, remembrance, and small meaningful habits — gathered in one quiet space.', 'الصلاة والقرآن والذكر وعادات صغيرة هادفة — في مساحة هادئة واحدة.')}</Label><Label muted>{t('Nurah is a study and organization tool. It does not issue fatwas.', 'نوراة أداة للتعلّم والتنظيم، ولا تصدر الفتاوى.')}</Label></Card>}
    {step === 1 && <Card><TextInput label={t('Your name', 'اسمك')} value={profile.name} maxLength={80} onChangeText={(name) => update({ name })} placeholder={t('Name or nickname', 'الاسم أو اللقب')} autoComplete="name" /><Label muted>{t('A nickname is welcome. No other personal details are needed.', 'يمكنك استخدام لقب. لا نحتاج إلى تفاصيل شخصية أخرى.')}</Label></Card>}
    {step === 2 && <LocationCard />}
    {step === 3 && <Card><MethodPicker /><Label muted>{t('Check the method used by your local mosque. Asr uses the standard shadow factor. Umm al-Qura uses a 90-minute Isha interval; verify Ramadan times with your mosque.', 'تحقّق من طريقة مسجدك المحلي. يُحسب العصر بالظل القياسي. تعتمد أم القرى ٩٠ دقيقة للعشاء؛ راجع مسجدك لأوقات رمضان.')}</Label></Card>}
    {step === 4 && <Card><Label>{t('Would you like reminders when they become available?', 'هل ترغب في التذكيرات عندما تتوفر؟')}</Label><Button title={t('Yes, save my preference', 'نعم، احفظ تفضيلي')} variant={profile.notifications ? 'primary' : 'secondary'} onPress={() => update({ notifications: true })} /><Button title={t('Keep it quiet', 'دون تذكيرات')} variant={!profile.notifications ? 'primary' : 'secondary'} onPress={() => update({ notifications: false })} /><Label muted>{t('Part 1 stores your preference only. Notification scheduling is not enabled and no permission is requested yet.', 'يحفظ الجزء الأول تفضيلك فقط. جدولة الإشعارات غير مفعّلة، ولا يُطلب الإذن حاليًا.')}</Label></Card>}
    <Button title={step === 4 ? t('Begin my day', 'ابدأ يومي') : step === 2 ? t('Continue (location is optional)', 'متابعة (الموقع اختياري)') : t('Continue', 'متابعة')} disabled={step === 1 && !profile.name.trim()} onPress={() => {
      if (step < 4) setStep(step + 1); else { update({ name: profile.name.trim(), onboarded: true }); router.replace('/(tabs)/home'); }
    }} />
    {step > 0 && <Button title={t('Back', 'رجوع')} variant="ghost" onPress={() => setStep(step - 1)} />}
  </Screen>;
}
