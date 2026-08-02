import { Pressable, StyleSheet, Text, View } from "react-native";

type SegmentOption = {
  label: string;
  value: string;
};

type LogSegmentedControlProps = {
  value: string;
  options: readonly SegmentOption[];
  onChange: (value: string) => void;
  variant?: "joined" | "split";
  size?: "default" | "large";
};

const styles = StyleSheet.create({
  shell: {
    minHeight: 40,
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD8D2",
    backgroundColor: "#FFFCFA",
    overflow: "hidden",
  },
  shellSplit: {
    minHeight: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    gap: 12,
    overflow: "visible",
  },
  segment: {
    minWidth: 64,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  segmentLarge: {
    minHeight: 48,
    borderRadius: 14,
  },
  segmentSplit: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD8D2",
    backgroundColor: "#FFFCFA",
  },
  segmentActive: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },
  segmentLabel: {
    color: "#0A0A0A",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  segmentLabelActive: {
    color: "#FAFAFA",
  },
});

export function LogSegmentedControl({
  value,
  options,
  onChange,
  variant = "joined",
  size = "default",
}: LogSegmentedControlProps) {
  const split = variant === "split";
  const large = size === "large";

  return (
    <View style={[styles.shell, split ? styles.shellSplit : null]}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            style={[
              styles.segment,
              split ? styles.segmentSplit : null,
              large ? styles.segmentLarge : null,
              active ? styles.segmentActive : null,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.segmentLabel,
                active ? styles.segmentLabelActive : null,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
