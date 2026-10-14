export interface DhikrItem {
  id: string;
  arabic: string;
  meaning: string;
  meaningAr: string;
  target: number;
  source: string;
  url: string;
}
export const ADHKAR: DhikrItem[] = [
  {
    id: "subhan",
    arabic: "سُبْحَانَ اللَّهِ",
    meaning: "Glory be to Allah",
    meaningAr: "تنزيه الله سبحانه",
    target: 33,
    source: "Sahih Muslim 597a · Abu Hurayrah · Sahih",
    url: "https://sunnah.com/muslim:597a",
  },
  {
    id: "hamd",
    arabic: "الْحَمْدُ لِلَّهِ",
    meaning: "Praise be to Allah",
    meaningAr: "الحمد والثناء لله",
    target: 33,
    source: "Sahih Muslim 597a · Abu Hurayrah · Sahih",
    url: "https://sunnah.com/muslim:597a",
  },
  {
    id: "takbir",
    arabic: "اللَّهُ أَكْبَرُ",
    meaning: "Allah is the greatest",
    meaningAr: "الله أكبر",
    target: 33,
    source: "Sahih Muslim 597a · Abu Hurayrah · Sahih",
    url: "https://sunnah.com/muslim:597a",
  },
];
export const DAILY_ADHKAR: DhikrItem[] = [
  {
    id: "ikhlas",
    arabic: "سورة الإخلاص · ١١٢",
    meaning: "Recite Surah Al-Ikhlas three times",
    meaningAr: "اقرأ سورة الإخلاص ثلاث مرات",
    target: 3,
    source: "Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)",
    url: "https://sunnah.com/abudawud:5082",
  },
  {
    id: "falaq",
    arabic: "سورة الفلق · ١١٣",
    meaning: "Recite Surah Al-Falaq three times",
    meaningAr: "اقرأ سورة الفلق ثلاث مرات",
    target: 3,
    source: "Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)",
    url: "https://sunnah.com/abudawud:5082",
  },
  {
    id: "nas",
    arabic: "سورة الناس · ١١٤",
    meaning: "Recite Surah An-Nas three times",
    meaningAr: "اقرأ سورة الناس ثلاث مرات",
    target: 3,
    source: "Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)",
    url: "https://sunnah.com/abudawud:5082",
  },
];
