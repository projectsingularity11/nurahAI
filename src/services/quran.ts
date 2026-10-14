import type { Ayah, Surah } from "../lib/models";
import { storage } from "../lib/storage";
const API = "https://api.alquran.cloud/v1";
interface ApiAyah {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
}
interface Edition {
  edition: { identifier: string };
  ayahs: ApiAyah[];
}
interface ApiResult<T> {
  code: number;
  data: T;
}
async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { signal: controller.signal });
  } catch {
    throw new Error(
      "Qur’an provider could not be reached. Check your connection or read a previously cached surah.",
    );
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok)
    throw new Error(
      "Qur’an provider is unavailable. Retry or read a previously cached surah.",
    );
  const body: ApiResult<T> = await response.json();
  if (body.code !== 200 || !body.data)
    throw new Error("Qur’an provider returned an invalid response.");
  return body.data;
}
async function cached<T>(
  key: string,
  load: () => Promise<T>,
): Promise<{ data: T; cached: boolean }> {
  try {
    const data = await load();
    await storage.setItem(key, JSON.stringify(data)).catch(() => undefined);
    return { data, cached: false };
  } catch (error) {
    const previous = await storage.getItem(key);
    if (previous) return { data: JSON.parse(previous) as T, cached: true };
    throw error;
  }
}
export const getSurahs = () =>
  cached<Surah[]>("nurah-surahs-v1", () => request<Surah[]>("/surah"));
export const getSurah = (number: number) =>
  cached<Ayah[]>(`nurah-surah-v1-${number}`, async () => {
    if (!Number.isInteger(number) || number < 1 || number > 114)
      throw new Error("Invalid surah number.");
    const editions = await request<Edition[]>(
      `/surah/${number}/editions/quran-uthmani,en.sahih,ar.alafasy`,
    );
    const arabic = editions.find(
      (e) => e.edition.identifier === "quran-uthmani",
    );
    const english = editions.find((e) => e.edition.identifier === "en.sahih");
    const audio = editions.find((e) => e.edition.identifier === "ar.alafasy");
    if (!arabic || !english || !audio)
      throw new Error("The requested Qur’an editions are unavailable.");
    return arabic.ayahs.map((a) => {
      const translation = english.ayahs.find((e) => e.number === a.number);
      const recitation = audio.ayahs.find((e) => e.number === a.number);
      if (
        !translation ||
        !recitation?.audio ||
        !recitation.audio.startsWith("https://")
      )
        throw new Error("Verse alignment or audio validation failed.");
      return {
        number: a.number,
        numberInSurah: a.numberInSurah,
        arabic: a.text,
        english: translation.text,
        audio: recitation.audio,
      };
    });
  });
