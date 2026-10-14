import { Redirect } from "expo-router";
import { useApp } from "../src/store/app";
import { LoadingState } from "../src/components/ui";
export default function Index() {
  const hydrated = useApp((s) => s.hydrated);
  const onboarded = useApp((s) => s.profile.onboarded);
  if (!hydrated) return <LoadingState />;
  return <Redirect href={onboarded ? "/(tabs)/home" : "/onboarding"} />;
}
