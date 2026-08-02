import { Pressable, StyleSheet, Text, View } from "react-native";

import { AddPhotoIcon } from "./LoggingIcons";

type LogMediaUploadButtonProps = {
  label: string;
  variant?: "outlined" | "dashed";
  selected?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFCFA",
  },
  outlined: {
    borderColor: "#B8C2C8",
  },
  dashed: {
    borderColor: "#AEB6BB",
    borderStyle: "dashed",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    color: "#5F6670",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  labelSelected: {
    color: "#145E22",
  },
  pressed: {
    opacity: 0.92,
  },
});

export function LogMediaUploadButton({
  label,
  variant = "outlined",
  selected = false,
  onPress,
}: LogMediaUploadButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === "dashed" ? styles.dashed : styles.outlined,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <AddPhotoIcon color={selected ? "#145E22" : "#5F6670"} />
        <Text style={[styles.label, selected ? styles.labelSelected : null]}>
          {selected ? "Photo attached" : label}
        </Text>
      </View>
    </Pressable>
  );
}
