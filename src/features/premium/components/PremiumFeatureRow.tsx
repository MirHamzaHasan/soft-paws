import { StyleSheet, Text, View } from "react-native";

import { PremiumCheckIcon } from "./PremiumIcons";

type PremiumFeatureRowProps = {
  label: string;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  label: {
    flex: 1,
    color: "#1F2528",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
});

export function PremiumFeatureRow({ label }: PremiumFeatureRowProps) {
  return (
    <View style={styles.row}>
      <PremiumCheckIcon />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
