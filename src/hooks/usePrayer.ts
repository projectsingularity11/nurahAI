import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { create } from 'zustand';
import type { Coordinates } from '../lib/models';
import { useApp } from '../store/app';
import { nextPrayer, prayerSchedule, qiblaBearing } from '../services/prayer';
interface LocationState { coords: Coordinates | null; loading: boolean; error: string | null; denied: boolean; source: 'gps' | 'manual' | null; request: () => Promise<void>; manual: (coords: Coordinates) => void }
// Coordinates stay in memory: never synced or written to disk.
export const usePosition = create<LocationState>((set) => ({
  coords: null, loading: false, error: null, denied: false, source: null,
  manual: (coords) => set({ coords, error: null, denied: false, source: 'manual' }),
  request: async () => {
    set({ loading: true, error: null });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { set({ denied: true, error: 'Location permission denied. Enable it in settings or enter coordinates below.' }); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({ coords: { latitude: position.coords.latitude, longitude: position.coords.longitude }, source: 'gps', denied: false });
    } catch { set({ error: 'Location is unavailable. Try again outdoors, or enter your coordinates manually.' }); }
    finally { set({ loading: false }); }
  },
}));
export function usePrayer() {
  const position = usePosition();
  const profile = useApp((s) => s.profile);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  try {
    if (!position.coords) return { ...position, now, schedule: [], next: null, bearing: null, calculationError: null };
    return { ...position, now, schedule: prayerSchedule(position.coords, profile.calculation_method, now, profile.mosque_overrides), next: nextPrayer(position.coords, profile.calculation_method, now, profile.mosque_overrides), bearing: qiblaBearing(position.coords), calculationError: null };
  } catch (error) { return { ...position, now, schedule: [], next: null, bearing: null, calculationError: error instanceof Error ? error.message : 'Prayer calculation failed.' }; }
}
