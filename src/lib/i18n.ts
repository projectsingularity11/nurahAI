import { useApp } from '../store/app';
import type { PrayerName } from './models';
export function useLanguage() {
  const locale = useApp((s) => s.profile.locale);
  const rtl = locale === 'ar';
  return { locale, rtl, t: (en: string, ar: string) => rtl ? ar : en };
}
export function prayerLabel(name: PrayerName, rtl = false) {
  const labels = { fajr: ['Fajr', 'الفجر'], dhuhr: ['Dhuhr', 'الظهر'], asr: ['Asr', 'العصر'], maghrib: ['Maghrib', 'المغرب'], isha: ['Isha', 'العشاء'] };
  return labels[name][rtl ? 1 : 0] ?? name;
}
