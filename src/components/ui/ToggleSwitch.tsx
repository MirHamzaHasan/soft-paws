import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

type ToggleSwitchProps = {
  checked: boolean;
  onPress: () => void;
  checkedTrackColor?: string;
  uncheckedTrackColor?: string;
};

const styles = StyleSheet.create({
  pressable: {
    flexShrink: 0,
  },
  track: {
    width: 48,
    height: 24,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "hidden",
  },
  trackChecked: {
    backgroundColor: "#0A0A0A",
  },
  trackUnchecked: {
    backgroundColor: "#DDE4E8",
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});

export function ToggleSwitch({
  checked,
  onPress,
  checkedTrackColor = "#0A0A0A",
  uncheckedTrackColor = "#DDE4E8",
}: ToggleSwitchProps) {
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: checked ? 1 : 0,
      damping: 18,
      mass: 0.9,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [checked, progress]);

  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      hitSlop={8}
      style={styles.pressable}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.track,
          checked
            ? [styles.trackChecked, { backgroundColor: checkedTrackColor }]
            : [styles.trackUnchecked, { backgroundColor: uncheckedTrackColor }],
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX: thumbTranslateX }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
