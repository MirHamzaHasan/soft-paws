import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TimelineEventRowProps = {
  icon: ReactNode;
  title: string;
  detail: string;
  time: string;
  titleColor: string;
  iconBorderColor: string;
  iconBackgroundColor: string;
  cardBackgroundColor?: string;
  accentColor?: string;
  meta?: string;
  showConnector?: boolean;
  onDelete?: () => void;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 16,
  },
  railWrap: {
    width: 40,
    alignItems: "center",
  },
  connector: {
    position: "absolute",
    top: 40,
    bottom: -24,
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#DFDBD6",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1DDD8",
    paddingBottom: 12,
  },
  cardHighlight: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderLeftWidth: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "500",
    letterSpacing: 0,
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 21,
  },
  detail: {
    color: "#5D646B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginTop: 2,
  },
  meta: {
    color: "#7A817F",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  time: {
    color: "#5D646B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },
  actions: {
    alignItems: "flex-end",
    gap: 8,
  },
  deleteButton: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  deleteText: {
    color: "#B02921",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
  },
});

export function TimelineEventRow({
  icon,
  title,
  detail,
  time,
  titleColor,
  iconBorderColor,
  iconBackgroundColor,
  cardBackgroundColor,
  accentColor,
  meta,
  showConnector = true,
  onDelete,
  onPress,
}: TimelineEventRowProps) {
  const highlighted = Boolean(cardBackgroundColor && accentColor);
  const content = (
    <>
      <View style={styles.railWrap}>
        {showConnector ? <View style={styles.connector} /> : null}
        <View
          style={[
            styles.iconCircle,
            {
              borderColor: iconBorderColor,
              backgroundColor: iconBackgroundColor,
            },
          ]}
        >
          {icon}
        </View>
      </View>

      <View style={styles.content}>
        <View
          style={
            highlighted
              ? [
                  styles.cardHighlight,
                  {
                    backgroundColor: cardBackgroundColor,
                    borderLeftColor: accentColor,
                  },
                ]
              : null
          }
        >
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                highlighted ? styles.titleCompact : null,
                { color: titleColor },
              ]}
            >
              {title}
            </Text>
            <View style={styles.actions}>
              <Text style={styles.time}>{time}</Text>
              {onDelete ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  style={styles.deleteButton}
                  onPress={onDelete}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <Text style={styles.detail}>{detail}</Text>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        style={styles.row}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}
