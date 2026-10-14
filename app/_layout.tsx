import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRuntime } from "../src/hooks/useRuntime";
import { colors } from "../src/components/ui";
export { ErrorBoundary } from "expo-router";
export default function RootLayout() {
  useRuntime();
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="focus"
          options={{ presentation: "fullScreenModal", gestureEnabled: false }}
        />
        <Stack.Screen name="assistant" />
      </Stack>
    </SafeAreaProvider>
  );
}
