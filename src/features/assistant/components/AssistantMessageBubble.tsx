import { StyleSheet, Text, View } from "react-native";

type AssistantMessageBubbleProps = {
  tone: "assistant" | "user";
  message: string;
  timestamp?: string;
};

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFCFA",
    borderColor: "#E8E2DC",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#121212",
    borderColor: "#121212",
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  assistantMessage: {
    color: "#5A6168",
  },
  userMessage: {
    color: "#868686",
  },
  timestamp: {
    alignSelf: "flex-end",
    color: "#5D646C",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400",
    marginRight: 8,
  },
});

export function AssistantMessageBubble({
  tone,
  message,
  timestamp,
}: AssistantMessageBubbleProps) {
  const user = tone === "user";

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bubble,
          user ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.message,
            user ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          {message}
        </Text>
      </View>

      {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
    </View>
  );
}
