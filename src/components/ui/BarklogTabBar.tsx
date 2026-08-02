import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type BarklogTabBarItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onPress?: () => void;
};

type BarklogTabBarProps = {
  items: BarklogTabBarItem[];
  variant?: "main" | "compact";
};

const styles = StyleSheet.create({
  chrome: {
    backgroundColor: "#FAFAFA",
    borderTopColor: "#E7E5E4",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    width: "100%",
    maxWidth: 390,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "400",
  },
  labelCompact: {
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

export function BarklogTabBar({ items, variant = "main" }: BarklogTabBarProps) {
  const compact = variant === "compact";

  return (
    <View style={styles.chrome}>
      <View style={styles.row}>
        {items.map((item) => {
          const color = item.active ? "#0A0A0A" : "#A8A29E";

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                pressed ? { opacity: 0.7 } : null,
              ]}
              onPress={item.onPress}
            >
              {item.icon}
              <Text
                style={[
                  styles.label,
                  { color, letterSpacing: compact ? 0.8 : 0.2 },
                  compact ? styles.labelCompact : null,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
