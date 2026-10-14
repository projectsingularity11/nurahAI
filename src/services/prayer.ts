import { CalculationMethod as AdhanMethod, Coordinates as AdhanCoordinates, PrayerTimes, Qibla } from 'adhan';
import type { CalculationMethod, Coordinates, PrayerName, Profile } from '../lib/models';
import { PRAYERS } from '../lib/models';
const calculators = { ISNA: AdhanMethod.NorthAmerica, MWL: AdhanMethod.MuslimWorldLeague, 'Umm al-Qura': AdhanMethod.UmmAlQura, Egyptian: AdhanMethod.Egyptian, Karachi: AdhanMethod.Karachi, Dubai: AdhanMethod.Dubai };
export interface PrayerTime { name: PrayerName; time: Date; overridden: boolean }
export function validCoordinates(value: Coordinates) {
  return Number.isFinite(value.latitude) && Number.isFinite(value.longitude) && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
}
export function validOverride(value: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
export function prayerSchedule(coords: Coordinates, method: CalculationMethod, date = new Date(), overrides: Profile['mosque_overrides'] = {}): PrayerTime[] {
  if (!validCoordinates(coords)) throw new Error('Enter a latitude from −90 to 90 and a longitude from −180 to 180.');
  const times = new PrayerTimes(new AdhanCoordinates(coords.latitude, coords.longitude), date, calculators[method]());
  return PRAYERS.map((name) => {
    const override = overrides[name];
    let time = times[name];
    if (override && validOverride(override)) {
      const [h, m] = override.split(':').map(Number);
      time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0);
    }
    if (!Number.isFinite(time.getTime())) throw new Error('Prayer times are unavailable for these coordinates and date. Consult your local mosque (high-latitude conditions may apply).');
    return { name, time, overridden: !!override && validOverride(override) };
  });
}
export function nextPrayer(coords: Coordinates, method: CalculationMethod, now = new Date(), overrides: Profile['mosque_overrides'] = {}): PrayerTime {
  const today = prayerSchedule(coords, method, now, overrides).filter((p) => p.time > now).sort((a, b) => a.time.getTime() - b.time.getTime());
  if (today[0]) return today[0];
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const next = prayerSchedule(coords, method, tomorrow, overrides).sort((a, b) => a.time.getTime() - b.time.getTime())[0];
  if (!next) throw new Error('No prayer times available.');
  return next;
}
export const qiblaBearing = (coords: Coordinates) => Qibla(new AdhanCoordinates(coords.latitude, coords.longitude));
