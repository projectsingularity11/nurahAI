export const METHODS = [
  "ISNA",
  "MWL",
  "Umm al-Qura",
  "Egyptian",
  "Karachi",
  "Dubai",
] as const;
export type CalculationMethod = (typeof METHODS)[number];
export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];
export type PrayerStatus = "prayed" | "missed" | "late";
export type Locale = "en" | "ar";
export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface Profile {
  id: string;
  name: string;
  calculation_method: CalculationMethod;
  notifications: boolean;
  locale: Locale;
  mosque_overrides: Partial<Record<PrayerName, string>>;
  onboarded: boolean;
}
export interface OwnedRecord {
  id: string;
  user_id: string;
  created_at: string;
}
export interface PrayerLog extends OwnedRecord {
  prayer: PrayerName;
  date: string;
  status: PrayerStatus;
}
export interface QuranBookmark extends OwnedRecord {
  surah: number;
  ayah: number;
}
export interface ReadingProgress extends OwnedRecord {
  surah: number;
  ayah: number;
  updated_at: string;
}
export interface Habit extends OwnedRecord {
  title: string;
  completed_dates: string[];
}
export interface Task extends OwnedRecord {
  title: string;
  completed: boolean;
  completed_at: string | null;
}
export interface DhikrSession extends OwnedRecord {
  phrase: string;
  count: number;
  date: string;
  checklist: string[];
}
export interface FocusSession extends OwnedRecord {
  prayer: PrayerName;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  confirmation: "manual" | "qr" | "nfc";
  reflection: string;
}
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}
export interface Ayah {
  number: number;
  numberInSurah: number;
  arabic: string;
  english: string;
  audio: string;
}
export interface Hadith {
  id: string;
  arabic: string;
  english: string;
  collection: string;
  number: string;
  narrator: string;
  grade: string;
  source_url: string;
  is_seed: boolean;
}
export interface Citation {
  label: string;
  url?: string;
  detail: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources: Citation[];
  refused?: boolean;
}
export interface Records {
  prayer_logs: PrayerLog[];
  quran_bookmarks: QuranBookmark[];
  reading_progress: ReadingProgress[];
  habits: Habit[];
  tasks: Task[];
  dhikr_sessions: DhikrSession[];
  focus_sessions: FocusSession[];
}
export type TableName = keyof Records;
export type TableRow<T extends TableName> = Records[T][number];
export interface PendingMutation {
  id: string;
  table: TableName;
  operation: "upsert" | "delete";
  row: Records[TableName][number];
}
type DbShape<T> = { [K in keyof T]: T[K] };
export type Database = {
  public: {
    Tables: {
      [T in TableName | "profiles"]: {
        Row: DbShape<
          T extends "profiles"
            ? Profile
            : T extends TableName
              ? TableRow<T>
              : never
        >;
        Insert: DbShape<
          T extends "profiles"
            ? Profile
            : T extends TableName
              ? TableRow<T>
              : never
        >;
        Update: Partial<
          T extends "profiles"
            ? Profile
            : T extends TableName
              ? TableRow<T>
              : never
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
