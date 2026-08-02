import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AssistantSendIcon } from "./AssistantIcons";

type AssistantComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  questionsRemaining: number;
  onUpgradePress?: () => void;
  onSendPress?: () => void;
};

const styles = StyleSheet.create({
  chrome: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C8D0D5",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  inputWrap: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#B2BAC1",
    backgroundColor: "#FFFCFA",
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: "#4B525A",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    textAlignVertical: "top",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  meta: {
    color: "#4A525A",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  upgrade: {
    color: "#4A525A",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
});

export function AssistantComposer({
  value,
  onChangeText,
  questionsRemaining,
  onUpgradePress,
  onSendPress,
}: AssistantComposerProps) {
  return (
    <View style={styles.chrome}>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          multiline
          placeholder="Ask about Max's health, habits, or records."
          placeholderTextColor="#848B93"
          style={styles.input}
          onChangeText={onChangeText}
        />

        <Pressable
          accessibilityRole="button"
          style={styles.sendButton}
          onPress={onSendPress}
        >
          <AssistantSendIcon />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {questionsRemaining} Questions Remaining
        </Text>
        <Pressable accessibilityRole="button" onPress={onUpgradePress}>
          <Text style={styles.upgrade}>Upgrade</Text>
        </Pressable>
      </View>
    </View>
  );
}
