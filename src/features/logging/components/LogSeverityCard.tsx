import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SeverityOption = {
  label: string;
  value: string;
};

type LogSeverityCardProps = {
  label: string;
  value: string;
  options: SeverityOption[];
  accentColor?: string;
  onChange: (value: string) => void;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD8D2",
    backgroundColor: "#FFFCFA",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    color: "#263136",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
  },
  value: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  railWrap: {
    position: "relative",
    height: 26,
    justifyContent: "center",
  },
  railBase: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E7EBEE",
  },
  railFill: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 999,
  },
  thumb: {
    position: "absolute",
    top: 1,
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#FFFCFA",
    backgroundColor: "#FFFCFA",
  },
  hitTargets: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  hitTarget: {
    flex: 1,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  levelLabel: {
    flex: 1,
    color: "#263136",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  labelStart: {
    textAlign: "left",
  },
  labelCenter: {
    textAlign: "center",
  },
  labelEnd: {
    textAlign: "right",
  },
});

export function LogSeverityCard({
  label,
  value,
  options,
  accentColor = "#F2C44B",
  onChange,
}: LogSeverityCardProps) {
  const [railWidth, setRailWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const maxIndex = Math.max(options.length - 1, 1);
  const progressRatio = activeIndex / maxIndex;
  const fillWidth = railWidth * progressRatio;
  const thumbLeft = railWidth * progressRatio;

  const resolveThumbTranslateX = () => {
    if (activeIndex === 0) {
      return 0;
    }

    if (activeIndex === maxIndex) {
      return -22;
    }

    return -11;
  };

  const resolveLabelAlignment = (index: number) => {
    if (index === 0) {
      return styles.labelStart;
    }

    if (index === options.length - 1) {
      return styles.labelEnd;
    }

    return styles.labelCenter;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{label}</Text>
        <Text style={[styles.value, { color: accentColor }]}>
          {options[activeIndex]?.label ?? value}
        </Text>
      </View>

      <View
        style={styles.railWrap}
        onLayout={(event) => setRailWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.railBase} />
        <View
          style={[
            styles.railFill,
            { width: fillWidth, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: thumbLeft,
              transform: [{ translateX: resolveThumbTranslateX() }],
              borderColor: "#FFFCFA",
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 999,
              backgroundColor: accentColor,
            }}
          />
        </View>

        <View style={styles.hitTargets}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              style={styles.hitTarget}
              onPress={() => onChange(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.labels}>
        {options.map((option, index) => (
          <Text
            key={option.value}
            style={[styles.levelLabel, resolveLabelAlignment(index)]}
          >
            {option.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
