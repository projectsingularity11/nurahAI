import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../lib/i18n";
import { colors } from "./ui";
type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "grid-outline",
  prayer: "moon-outline",
  quran: "book-outline",
  learn: "sparkles-outline",
  me: "person-outline",
};
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { rtl } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        direction: "ltr",
        flexDirection: rtl ? "row-reverse" : "row",
        paddingTop: 10,
        paddingBottom: Math.max(12, insets.bottom),
        backgroundColor: colors.canvas,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        const title = descriptors[route.key]?.options.title ?? route.name;
        const color = selected ? colors.gold : colors.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={title}
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!selected && !event.defaultPrevented)
                navigation.navigate(route.name, route.params);
            }}
            onLongPress={() =>
              navigation.emit({ type: "tabLongPress", target: route.key })
            }
          >
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={23}
              color={color}
            />
            <Text
              style={{
                color,
                fontSize: 11,
                writingDirection: rtl ? "rtl" : "ltr",
              }}
            >
              {title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
