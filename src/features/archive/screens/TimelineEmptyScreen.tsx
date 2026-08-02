import { StyleSheet, Text, View } from "react-native";

import { HomeShell } from "../../home/components/HomeShell";
import { ArchiveStackIllustration } from "../../states/components/StateIllustrations";

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 620,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    color: "#273136",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  message: {
    maxWidth: 420,
    color: "#5D666E",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
    textAlign: "center",
  },
});

export default function TimelineEmptyScreen() {
  return (
    <HomeShell
      activeTab="timeline"
      headerVariant="compact"
      headerAvatarEmoji="🧑"
      headerAvatarBackgroundColor="#E4E8F2"
      tabRoutes={{ timeline: "/timeline-empty" }}
    >
      <View style={styles.wrap}>
        <ArchiveStackIllustration size={176} />
        <Text style={styles.title}>The Archive is Empty</Text>
        <Text style={styles.message}>
          Nothing logged yet today. Tap any button on Home to get started.
        </Text>
      </View>
    </HomeShell>
  );
}
