import { View } from "react-native";
import { METHODS } from "../lib/models";
import { useApp } from "../store/app";
import { Button } from "./ui";
export function MethodPicker() {
  const profile = useApp((s) => s.profile);
  const update = useApp((s) => s.updateProfile);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {METHODS.map((method) => (
        <Button
          key={method}
          title={`${profile.calculation_method === method ? "✓ " : ""}${method}`}
          variant={
            profile.calculation_method === method ? "primary" : "secondary"
          }
          onPress={() => update({ calculation_method: method })}
        />
      ))}
    </View>
  );
}
