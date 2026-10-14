export interface DhikrItem { id: string; arabic: string; meaning: string; target: number; source: string; url: string }
export const ADHKAR: DhikrItem[] = [
  { id: 'subhan', arabic: 'سُبْحَانَ اللَّهِ', meaning: 'Glory be to Allah', target: 33, source: 'Sahih Muslim 597a · Abu Hurayrah · Sahih', url: 'https://sunnah.com/muslim:597a' },
  { id: 'hamd', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Praise be to Allah', target: 33, source: 'Sahih Muslim 597a · Abu Hurayrah · Sahih', url: 'https://sunnah.com/muslim:597a' },
  { id: 'takbir', arabic: 'اللَّهُ أَكْبَرُ', meaning: 'Allah is the greatest', target: 33, source: 'Sahih Muslim 597a · Abu Hurayrah · Sahih', url: 'https://sunnah.com/muslim:597a' },
];
export const DAILY_ADHKAR: DhikrItem[] = [
  { id: 'ikhlas', arabic: 'سورة الإخلاص · ١١٢', meaning: 'Recite Surah Al-Ikhlas three times', target: 3, source: 'Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)', url: 'https://sunnah.com/abudawud:5082' },
  { id: 'falaq', arabic: 'سورة الفلق · ١١٣', meaning: 'Recite Surah Al-Falaq three times', target: 3, source: 'Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)', url: 'https://sunnah.com/abudawud:5082' },
  { id: 'nas', arabic: 'سورة الناس · ١١٤', meaning: 'Recite Surah An-Nas three times', target: 3, source: 'Abu Dawud 5082 · Abdullah ibn Khubayb · Hasan (Al-Albani)', url: 'https://sunnah.com/abudawud:5082' },
];
