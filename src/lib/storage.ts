import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// Expo's web exporter has no window; don't access browser storage during export.
export const storage = {
  getItem: (key: string) =>
    Platform.OS === "web" && typeof window === "undefined"
      ? Promise.resolve(null)
      : AsyncStorage.getItem(key),
  setItem: (key: string, value: string) =>
    Platform.OS === "web" && typeof window === "undefined"
      ? Promise.resolve()
      : AsyncStorage.setItem(key, value),
  removeItem: (key: string) =>
    Platform.OS === "web" && typeof window === "undefined"
      ? Promise.resolve()
      : AsyncStorage.removeItem(key),
};
