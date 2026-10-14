import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, EmptyState, ErrorState, Label, Row, Screen, SectionHeader, TextInput } from '../../src/components/ui';
import { LocationCard } from '../../src/components/LocationCard';
import { MethodPicker } from '../../src/components/MethodPicker';
import { usePrayer } from '../../src/hooks/usePrayer';
import { owned, useApp } from '../../src/store/app';
import { PRAYERS, type PrayerName, type PrayerStatus } from '../../src/lib/models';
import { localDate, timerText } from '../../src/lib/dates';
import { prayerLabel, useLanguage } from '../../src/lib/i18n';
import { validOverride } from '../../src/services/prayer';
export default function PrayerScreen() {
  const prayer = usePrayer(); const { t, rtl, locale } = useLanguage(); const router = useRouter();
  const profile = useApp((s) => s.profile); const records = useApp((s) => s.records); const put = useApp((s) => s.put); const update = useApp((s) => s.updateProfile);
  const [overrides, setOverrides] = useState(profile.mosque_overrides); const [error, setError] = useState('');
  const date = localDate(prayer.now);
  function log(name: PrayerName, status: PrayerStatus) {
    const existing = records.prayer_logs.find((r) => r.date === date && r.prayer === name);
    put('prayer_logs', { ...existing ?? owned(), prayer: name, date, status });
  }
  return <Screen title={t('Return to stillness.', 'عُد إلى السكينة.')} subtitle={t('PRAYER · YOUR DAILY ANCHOR', 'الصلاة · ركيزة يومك')}>
    {prayer.next && <Card accent><Label gold>{t('NEXT PRAYER', 'الصلاة القادمة')}</Label><Row style={{ justifyContent: 'space-between' }}><Label size={34}>{prayerLabel(prayer.next.name, rtl)}</Label><Label size={24} gold>{prayer.next.time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</Label></Row><Label size={40} style={{ fontVariant: ['tabular-nums'] }}>{timerText((prayer.next.time.getTime() - prayer.now.getTime()) / 1000)}</Label><Button title={t('Enter Salah Focus', 'ابدأ تركيز الصلاة')} onPress={() => router.push({ pathname: '/focus', params: { prayer: prayer.next?.name ?? 'fajr' } })} icon="moon-outline" /></Card>}
    {!prayer.coords && <EmptyState title={t('Let’s find your prayer times', 'لنحدّد مواقيت صلاتك')} message={t('Allow location or enter coordinates below. No sample times are shown.', 'اسمح بالموقع أو أدخل الإحداثيات أدناه. لا نعرض أوقاتًا تجريبية.')} />}
    {prayer.calculationError && <ErrorState message={prayer.calculationError} />}
    <SectionHeader title={t('Today’s prayers', 'صلوات اليوم')} note={prayer.now.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })} />
    {prayer.schedule.map((p) => { const status = records.prayer_logs.find((r) => r.prayer === p.name && r.date === date)?.status; return <Card key={p.name}><Row style={{ justifyContent: 'space-between' }}><Label size={22}>{prayerLabel(p.name, rtl)}</Label><Label gold>{p.time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}{p.overridden ? t(' · Mosque', ' · المسجد') : ''}</Label></Row><View style={{ flexDirection: rtl ? 'row-reverse' : 'row', gap: 8, flexWrap: 'wrap' }}>{(['prayed', 'late', 'missed'] as const).map((s) => <Button key={s} title={`${status === s ? '✓ ' : ''}${s === 'prayed' ? t('Prayed', 'صلّيت') : s === 'late' ? t('Late', 'متأخر') : t('Missed', 'فاتتني')}`} variant={status === s ? 'primary' : 'secondary'} onPress={() => log(p.name, s)} />)}<Button title={t('Focus', 'تركيز')} variant="ghost" onPress={() => router.push({ pathname: '/focus', params: { prayer: p.name } })} /></View></Card>; })}
    {prayer.bearing !== null && <Card><Label size={20}>{t('Qibla direction', 'اتجاه القبلة')}</Label><Label size={42} gold style={{ textAlign: 'center' }}>↗ {prayer.bearing.toFixed(1)}°</Label><Label muted>{t('Clockwise from true north. Align with a compass corrected to true north; this is a bearing, not a live compass.', 'من الشمال الحقيقي باتجاه عقارب الساعة. استخدم بوصلة مصحّحة للشمال الحقيقي؛ هذا اتجاه محسوب وليس بوصلة حية.')}</Label></Card>}
    <LocationCard />
    <Card><SectionHeader title={t('Calculation method', 'طريقة الحساب')} /><MethodPicker /></Card>
    <Card><SectionHeader title={t('Mosque time overrides', 'أوقات المسجد اليدوية')} /><Label muted>{t('Enter local 24-hour times (HH:MM). Leave blank to use calculated times. Overrides repeat daily until cleared.', 'أدخل الوقت المحلي بصيغة ٢٤ ساعة (HH:MM). اترك الحقل فارغًا للحساب التلقائي. تتكرر الأوقات يوميًا حتى مسحها.')}</Label>
      {PRAYERS.map((name) => <TextInput key={name} label={prayerLabel(name, rtl)} placeholder="HH:MM" value={overrides[name] ?? ''} onChangeText={(value) => setOverrides((s) => ({ ...s, [name]: value }))} keyboardType="numbers-and-punctuation" maxLength={5} />)}
      {error && <ErrorState message={error} />}
      <Button title={t('Save mosque times', 'احفظ أوقات المسجد')} onPress={() => {
        if (Object.values(overrides).some((v) => v && !validOverride(v))) { setError(t('Use HH:MM, from 00:00 to 23:59.', 'استخدم HH:MM من 00:00 إلى 23:59.')); return; }
        update({ mosque_overrides: overrides }); setError('');
      }} />
      <Button title={t('Clear all overrides', 'امسح الأوقات اليدوية')} variant="ghost" onPress={() => { setOverrides({}); update({ mosque_overrides: {} }); setError(''); }} />
    </Card>
  </Screen>;
}
