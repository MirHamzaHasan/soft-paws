import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    flexDirection: 'row',
    gap: 18,
  },
  railWrap: {
    width: 54,
    alignItems: 'center',
  },
  connector: {
    position: 'absolute',
    top: 58,
    bottom: -30,
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#DFDBD6',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1DDD8',
    paddingBottom: 22,
  },
  cardHighlight: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    borderLeftWidth: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '400',
    letterSpacing: -0.8,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  detail: {
    color: '#5D646B',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
    marginTop: 6,
  },
  meta: {
    color: '#7A817F',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  time: {
    color: '#5D646B',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  deleteText: {
    color: '#B02921',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
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
